# Testing with Hookd
Run `npm t` to test with Jest.
- Presets and configs will be found in `./jest-preload.js` and `../jest.config.js`
## Modularity of Testing
- Ability to test visitors, but visitors themselves are difficult to modularize as they do depend on each other to work
- Testing helper functions TBD
## Issues
- Overall, there are ENOUGH edge cases with this app to go around.
- Inside the test `/components` will have commented out edge cases until accounted for, and `xit`s within the `test.ts` files themselves.
- Tests are going to be modularized but the `../util` will be *TBD*