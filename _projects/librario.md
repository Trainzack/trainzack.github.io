---
title: Librario
blurb: Band library management software.
card-image: librario.png
github: https://github.com/Trainzack/Librario
---

Some large bands and orchestras have difficulty organizing and distributing their sheet music to their musicians. If done manually, the process of storing, collating, and distributing sheet music is slow and laborious. This increases the costs of running an ensemble, and if resources are limited (as they are in school and community based ensembles) it can can place an artificial limitation on the number of pieces of music the band plays.

A common solution to this problem is for the band’s music librarian to make “packets” of music. A packet is a single document that contains all of one musician’s parts from all of the songs in a particular performance. The packet can then be photocopied for each person playing that part, or the packet can be distributed online. 

These packets often require a large amount of manual labor to create, either in generic document editing tools or with creative use of a document scanner. The resulting packets are often of low quality and difficult to modify at a later date. For bands that put half-sized sheet music into flip folios, the music in the packet may not even be the right size to fit inside the band’s folders.

## Goal

A specialized band library management application can automate the process of creating these packets, and remove the limitations that a large amount of manual labor can create. 

Such an application requires a database of pieces of music, containing both the metadata of each piece (such as the title and the composer) as well as the actual sheet music itself. The user should be able to export the music to create whatever packets they need. After the initial overhead of digitally scanning the library’s sheet music, the actual time required to create these packets is only the time needed to figure out what should be in them. As macOS is the industry standard for musicians, it is likely that many band librarians are most comfortable with is, and therefore the application must target macOS.

I have begun work on this application, which I have entitled Librario. The goal of this project was to finalize Librario’s overall software design, and to design and test its user interface.

## Design and Implementation

Librario was written in Java 15. Multiple external libraries were used: the graphical user interface was created using JavaFX, while the sheet music processing was written using Apache PDFBox. The top of the data hierarchy is the library. Each library contains a number of other objects: Pieces, Ensembles, and Lists. 

{% include image.html
    src="librario/Fig 1.1.png"
    alt="A screenshot of Librario showing the 'pieces' screen."
    caption="This screen shows all of the pieces in the user's library. From here, users can select one or more pieces to edit, export, delete, or add to a list."
%}

Each piece contains the metadata and sheet music for a particular piece of music. 


{% include image.html
    src="librario/Fig 1.2.png"
    alt="A screenshot of Librario showing the 'ensembles' screen."
    caption="This screen shows the details of any particular ensemble and allows the user to edit those details."
%}

Ensembles are representations of individual bands that any one band library might serve. Each one contains enough information about the band (generally the number of instruments playing each part) to allow the software to export packets tailored to that band.

{% include image.html
    src="librario/Fig 1.3.png"
    alt="A screenshot of Librario showing the 'list' screen."
    caption="This screen shows the pieces in any particular list and allows the user to add or remove pieces from the list, rename the list, and reorder the list."
%}

Lists are lists of pieces. They allow users to easily group pieces together so that they may be exported into one packet.

Users can navigate between the screens using the navigation bar on the left side. This design pattern was used due to its similarities to several popular macOS applications, including iTunes.

## User Testing

The prototype was usability tested with four participants, chosen from a pool of my acquaintances. Each participant was an amateur musician, and half of them had previous band librarian experience.

Each participant was given the same set of instructions and was asked to perform several tasks that exercised each part of the application. No quantitative data was recorded, however qualitative data was collected. This data mostly consisted of the testers’ observations and my own observations of the testers’ actions. The results demonstrated that the overall design was functional as no user failed to complete any task. 

{% include image.html
    src="librario/Fig 1.4.png"
    alt="A screenshot of Librario showing the 'export' screen."
    caption="This screen allows the user to control exactly how their pieces are exported to PDF."
%}

The tests also revealed some areas in need of improvement. The testers encountered a few common difficulties that revealed issues with the user interface design, which I addressed. For example, most testers were confused by the original export screen, so I pared it back to the most useful controls as shown in the above image. 

## Conclusion and Future Work

The completion of the design and user interface of Librario is a step towards completing and publicly releasing Librario. 

The user testing process proved to be valuable, and I plan to repeat it before I release the program to the general public. The user interface is almost complete and the most of the core functionality of the software is complete. Yet, there are still many tasks yet to be completed before Librario will be ready for an initial release. These include:

- The specification, design, and implementation of the ability to save and load the library database between uses of the program.

- The implementation of a way for users to add and modify the library’s sheet music.

- The creation of a toolchain to allow me to create a Librario macOS executable.

- The creation of external documentation and guides to help users understand the software.

- The implementation of a search system.

After Librario’s initial release, there are many features that could be added to increase the utility of the software. These include:

- An undo-redo stack.

- Localization.

- Integration with a separate web-based publishing platform.

## Acknowledgments

This project would not have been possible without the support, and guidance given by my mentor, Dr. Ben Steichen.

I would also like to thank Drs. Mitch Fennell, Gregory Whitmore, and Rickey Badua for clarifying the scope of the project and giving invaluable feedback.