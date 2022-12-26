# Mapty

JavaScript learning Project for an online Application running entirely in the browser.

## Introduction

This application renders workouts based on the user's location.

A workout that could be chosen:

- Running
- Cycling

The app gets the current location from the browser and passes those cords into a library which renders a map on the position where the user can then initialize workouts by simple click events.

As soon as a workout gets submitted mapty will process the user data makes several ajax calls in the background and show the user the corresponding information for

- the location
- calculations (pace, speed)

The UI can be manipulated from the user by:

- Deleting workouts
- Deleting all workouts
- Sorting workouts
- Navigating the map on the corresponding workouts on the map

### OOP

- Workout class parent
- - Running Workout class child
- - Cycling Workout class child

- APP class
  Creating instances from running, cycling workouts.
  Holding all the underlying data of the application, which deals with the User Interface.

#### Data

#### Libraries

- Leaftlet

### Apis

- https://geocode.xyz/

- Data is stored in local storage

## INSTALLATION

Install npm and run npm init.

## Contributors

- Jonas Schmedtmann - https://github.com/jonasschmedtmann
- Amit Kumar - https://github.com/iamamitkumar0512
