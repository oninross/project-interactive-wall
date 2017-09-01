# Interactive Wall

Powered by Firebase Database and Storage, Node.js, ExpressJS and Socket.IO.  Desktop and tablet versions will show a wall of pictures taken from the web app.  Mobile versions will redirect the users to the web app.  The web app can take a picture using your mobile phone, rotate the image and the user can either swipe the picture or flick the mobile device to the wall.  In real-time, users can see the image "fly in" the digital wall.

Inspired by watching Ironman when Tony Stark wanted to show the hologram from his high-tech phone.  He "flicked" his phone to the air showing the hologram to his audience.

Here is a [demo](https://project-interactive-wall.herokuapp.com).  To fully experience the project, you must open one on desktop and one on your mobile phone.

## Bits and Pieces
### Firebase Database
This is where you store the image ***filenames*** so the wall has reference of what images has been taken and stored.  You might want to create your own Firebase account as the one included here is still connected to mine.

### Firebase Storage
This is where you store the image ***files*** so the database can pull these out and display it on the wall.  You might want to create your own Firebase account as the one included here is still connected to mine.

### Node.js
The heart of our server.

### ExpressJS
Fast, unopinionated, minimalist web framework for Node.js.  It just makes everything easier server-side.

### Socket.IO
Real-time bidirectional event-based communication.  Making real-time communication way too easy.

## What's in the box?
### _root folder
- `package.json` - It houses all the things that you will need to run this project locally.  `npm install` or `yarn install` will initialise the node modules for the project.

- `Procfile` - You need this if you have plans to run this project in Heroku.  It just tells Heroku which file should they be running when it is deployed.

- `server.js` - The brains of the project.  This is where the logic behind where the page should be going when they are on desktop or on mobile.  It is also the place where the desktop site and web app communicates with each other when a photo has been "flicked/swiped."

## prototype folder
The entire frontend of the project is built using [Firestarter](https://github.com/oninross/firestarter).  Visit the github page for more reference on how to set it up.  One thing that I need to point out here is that `gulp --production` is the command that transfers production assets from the prototype folder to the client folder

## client folder
This folder is the one where `server.js` is referencing when deployed or developing locally.

## Things to take note of
- There is no validation of the images taken by the users.  I have managed to integrate it with Google Vision API and returns the results quite fast.

- To fully test the desktop and webapp completely, you need to fake the SSL.  Otherwise deploying to a server and waiting for it to be built is painful.

- There seems to be a limitation when using Private mode in Safari iOS.  It goes through the entire user journey of taking a picture and saving it to the database.  However the image turns out to be empty.  It only happens on iOS.  My guess is that since its in Private mode, it doesn't save even temporaritly.

## Disclaimers
It is an MVP that I just want to share with everyone.  Use at your own risk in whatever way you want with this.  There are so many holes that needs to be plugged in and it can be further improved.

## License
[MIT License](LICENSE.md) - &copy; Nino Ross Rodriguez