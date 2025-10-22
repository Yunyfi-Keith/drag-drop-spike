# TypeScript Interview Exercise

* Setup: `npm install`
* Run dev server: `npm run dev`
* TypeScript check: `npm run ts`
* Tests: `npm run test`


## Goal
The goal of this exercise is to allow a user to send feedback via a feedback entry screen. The basic requirements are:

1. When the user clicks the `Send Feedback` button, the screen transitions to show `Sending feedback...`.
2. The feedback form should disappear.
3. If the request succeeds, show a `Feedback received successfully` message.
4. If the request fails, show a `Feedback request failed` message.

## Codebase Overview
* The codebase here is potentially something that a junior/less experienced developer may have worked on.
* Refactoring is welcome - we will talk through any refactoring that you have made as part of reviewing the solution to the exercise.

## Implementation Notes

* The codebase is TypeScript and plain old HTML. Jest is used for tests.
* State management is handled using a custom solution - there is no need to introduce Redux or any other library as part of the solution.
* The backend is stubbed out - there is no need to extend the stub service/implement a real backend.