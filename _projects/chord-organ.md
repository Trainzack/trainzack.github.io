---
title: Seeds Chord Organ
blurb: A firmware update for the Ginkosynthese Seeds that adds a chord organ voice.
card-image: seeds.png
github: https://github.com/Trainzack/seeds-chord-organ
---

## Introduction

### The Ginkosynthese Seeds

The [Ginkosynthese Seeds](https://www.ginkosynthese.com/product/1070494/seeds-assembled)
is an 8 bit [Eurorack](https://en.wikipedia.org/wiki/Eurorack) synthesizer. I
was impressed with the amount of features that were advertised for the price
(a complete voice for only €109 and some soldering? what a steal!),
so I bought a kit and assembled it.

It had 8 sound generation algorithms (even more now) to choose between, a tuning
knob (which doubles as a quantizer control), an [attack](https://en.wikipedia.org/wiki/Envelope_(music))
knob (which doubles as a decay knob), and a modulation knob (which doubles as a filter cutoff knob).
Each of the knobs can also be controlled by applying voltages to the input jacks,
although only the knob's primary function can be controlled in this way.

I was pretty impressed with the module, but I noticed something lacking.
While all of the voices included sounded good, they were all single tones.
What I really wanted was chords, and I thought that the module was capable of it.
So, since the manufacturers generously made the firmware [open source](https://www.ginkosynthese.com/firmware),
I dug into it, and ended up making a chord organ.

### What is a chord organ?

A chord organ is a type of VCO (voltage controlled oscillator). A VCO generates
a tone of some kind. It also has an input jack, and when a voltage is applied to the input,
the pitch of the oscillator's tone changes depending on the exact voltage applied--the
  most common standard is 1 volt per octave. A chord organ simply generates additional
  tones that are related to the original tone in such a way that they create a chord.

There are several chord organ modules available for Eurorack. The
[Qu-Bit Chord v2](https://www.modulargrid.net/e/qu-bit-electronix-chord-v2) particularly comes to mind,
though there is also an [alternate firmware](https://medium.com/music-thing-modular-notes/chord-organ-the-easiest-way-to-get-simple-chords-from-a-modular-synth-2f48684fdb9a)
for the [Music Thing Modular Radio Music](https://www.modulargrid.net/e/music-thing-modular-radio-music),
and a [hidden mode](https://synthmodes.com/modules/rings/#peace) for [Mutable instruments Rings](https://www.modulargrid.net/e/mutable-instruments-rings).

## Writing the firmware

### Structure

When I dove into the firmware, I found that it was laid out in a neatly organized way
that was open to modification. There were two sections of the program that were
relevant to me: the `loop()` function, which handles input processing, and the
`PWM_INTERRUPT` signal handler, which handles sound synthesis and
setting the value of the sound output. Both sections have large switch statements
to account for which voice is currently selected.

`master_phase` is a 16 bit unsinged integer that
represents the current phase of the output sound wave. As part of the input
handling, `loop()` determines what pitch the module should be producing.
Using a lookup table, it figures out how much `master_phase`
 should increase each `PWM_INTERRUPT`, then it stores that number in `m_phase_inc`.

The `PWM_INTERRUPT` handler, which runs much more frequently than `loop()`, increases
`master_phase` by `m_phase_inc`. Then, each voice has its own function for processing
the sound, and figuring out what value to store in the `output` variable, which is sent as
a voltage to the output jack.

### Implementation

Please note that I'm writing this document over half a year after I wrote the firmware,
so some of the details are hazy. The code snippets below are recreations of my
thought process, and may not actually have correct syntax.

To create a simple increasing ramp waveform, we can simply send `master_phase`
right to `output` (with appropriate scaling). Each PMW interrupt, the output will
increase slightly at a linear rate, until `master_phase` overflows and returns
to zero.

One of the original voices does this, and by taking out the modulation, that
voice can be simplified to one statement:

```c++
void pwmSawProcess()
{
  output = master_phase >> 8;
}
```

If we want a chord, all we need to do is add four different phases together.
We'll have to keep track of a few more phases, so we need to declare a few more
phase variables. These phases also need to increase at different rates, otherwise
we would just have four copies of the same note. So, to get different notes
that spell out a chord, we will multiply m_phase_inc by the ratio of each note
in the chord to the root note.

For a major chord, that process looks something like this:

```c++
void chordProcess()
{

	chord_phase_1 += (uint_16) (m_phase_inc * 1.0f);
	chord_phase_2 += (uint_16) (m_phase_inc * 1.333f);
	chord_phase_3 += (uint_16) (m_phase_inc * 2.0f);
	chord_phase_4 += (uint_16) (m_phase_inc * 2.5833f);

	output = (chord_phase_1 >> 10) +
		(chord_phase_2 >> 10) +
		(chord_phase_3 >> 10) +
		(chord_phase_4 >> 10);
}
```

### Bug-fixing

In theory this works, but in practice floating point math is far too slow. Seeds
uses a cheap 8-bit microcontroller: the [Arduino Nano](https://store.arduino.cc/usa/arduino-nano).
It's a 16Mhz processor with 1kB of RAM, and 30kB of flash memory, so we really have
to pay attention to performance.
We can approximate floating point numbers with a bit of bit-shifting, though
we need to convert it to a 32 bit number.

That looks like this:

```c++
void chordProcess()
{

	chord_phase_1 += (uint_16) (((uint32_t)m_phase_inc * 256) >> 8);
	chord_phase_2 += (uint_16) (((uint32_t)m_phase_inc * 384) >> 8);
	chord_phase_3 += (uint_16) (((uint32_t)m_phase_inc * 512) >> 8);
	chord_phase_4 += (uint_16) (((uint32_t)m_phase_inc * 645) >> 8);

	output = (chord_phase_1 >> 10) +
		(chord_phase_2 >> 10) +
		(chord_phase_3 >> 10) +
		(chord_phase_4 >> 10);
}
```

Once I tried this, I was actually able to get a chord out of the module! I was
overjoyed, until I got out my tuner and realized that the chords were 20 cents
flat. My processing code was running too slowly, causing the microcontroller to miss
some of the PMW interrupts, and therefore causing `master_phase` to increment too
slowly.

After a few hours of work and failed optimizations, I nailed down the culprit:
the 32 bit math was still too slow. This put me in a bit of a pickle, as I
couldn't get the ratios accurate enough to sound good without going into the 32
bit range.

My grand epiphany was that I didn't need to do the 32 bit math every PWM interrupt!
The math only needs to be done as often as `m_phase_inc` changes, which happens
only every time `loop()` is called.

So, by storing a `phase_inc` value for each note, and by updating those values
in `loop()` instead of in the `PWM_INTERRUPT` handler, we're able to do the
expensive 32 bit calculations only when they're needed, and save enough processing
power that the module stops missing PWM interrupts.

Add in a bank of chords stored in an array, and the whole thing looks like this:

 ```c++
 //mode 9 (chord) variables
 const uint8_t chord_ratio_exponent = 8;
 const uint8_t num_chords = 10;

 const uint16_t chords[][4] = {
   { 256, 128, 256, 512},  // 8ves
   { 256, 256, 256, 256},  // unison
   { 256, 341, 455, 607},  // stacked perfect 4ths
   { 256, 384, 512, 683},  // sus4
   { 256, 384, 512, 645},  // major
   { 256, 384, 483, 645},  // major 7th
   { 256, 384, 455, 645},  // dominant 7th
   { 256, 384, 455, 614},  // minor 7th
   { 256, 384, 483, 614},  // minor major 7th
   { 256, 406, 512, 645},  // augmented
 };

 uint16_t chord_phase_1 = 0;
 uint16_t chord_phase_2 = 0;
 uint16_t chord_phase_3 = 0;
 uint16_t chord_phase_4 = 0;

 uint16_t chord_phase_inc_1 = 0;
 uint16_t chord_phase_inc_2 = 0;
 uint16_t chord_phase_inc_3 = 0;
 uint16_t chord_phase_inc_4 = 0;

 /** ... **/

 //main loop. This deals with getting and processing our various inputs
 void loop()
 {

 /** ... handle input and set m_phase_inc ... **/

 	switch (mode)
 	{
    /** ... **/
 		case chord_mode:
 		  // Here we figure out what the currently selected chord is based on the mod knob and mod CV value
 		  current_chord = map((mod_con_val * (((uint16_t)analogRead(MOD_CV) >> 2))) >> 5, 0, 2048, 0, num_chords);
 		  current_chord = constrain(current_chord, 0, num_chords - 1);

 		  // Here we figure out how much to increment the phase of each note based on the currently selected chord
 		  // The small constant offsets are to ensure each oscillator is slightly out of unison
 		  chord_phase_inc_1 = (( (uint32_t)(m_phase_inc) * chords[current_chord][1]) >> chord_ratio_exponent);
 		  chord_phase_inc_2 = (( (uint32_t)(m_phase_inc) * chords[current_chord][2]) >> chord_ratio_exponent) + 1;
 		  chord_phase_inc_3 = (( (uint32_t)(m_phase_inc) * chords[current_chord][3]) >> chord_ratio_exponent) - 1;
 		  chord_phase_inc_4 = (( (uint32_t)(m_phase_inc) * chords[current_chord][4]) >> chord_ratio_exponent) + 2;

 		  break;
 	}


  /** ... **/
 }

 /** ... processing functions of original voices ... **/

 void chordProcess()
 {
   // This could be a loop over two arrays, but it's unrolled to save processing power, though I'm not sure it really needs it
 	chord_phase_1 += chord_phase_inc_1;
 	chord_phase_2 += chord_phase_inc_2;
 	chord_phase_3 += chord_phase_inc_3;
 	chord_phase_4 += chord_phase_inc_4;

 	// Add the phases to the output, creating four upramp sawtooth waves.
 	// We bitshift each phase down to adjust the level.
 	output = (chord_phase_1 >> 10) +
 		(chord_phase_2 >> 10) +
 		(chord_phase_3 >> 10) +
 		(chord_phase_4 >> 10);
 }

 SIGNAL(PWM_INTERRUPT)
 {
 	output = 0;
 	master_phase += m_phase_inc;
 	decay_counter++;
 	decay_counter &= 0b00000111;

 	switch (mode)
 	{
 		case grain_mode:
 			grainProcess();
 			break;
 		case tri_mode:
 			triProcess();
 			break;
    /** ... **/
 		case chord_mode:
 			chordProcess();
 			break;
 	}

 	/** Process filter and envelope **/
 	PWM_VALUE = output;
 }
 ```

## The Result

You can hear some examples of what the chords sound like on the [GitHub page](https://github.com/Trainzack/seeds-chord-organ).
I shared this with the module's manufacturer, and they liked it enough to include
in version 1.2 of the firmware, which is about the third coolest thing that's happened to me.

I hope that many people can make use of this sound in their music!
