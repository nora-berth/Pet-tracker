// Template for a new Page Object.
// Copy into e2e/pages/<route>.page.js, rename the class to match the route, and fill in
// the real locators/actions. Delete any section you don't need.
//
// Rules (see SKILL.md for the why):
// - One class per route.
// - All locators declared in the constructor. Static locators are properties; locators that
//   depend on data (a name, an id) are arrow functions.
// - Methods perform actions only. No expect() in this file — assertions belong in the spec.

export class ExamplePage {
  constructor(page) {
    this.page = page;

    // --- Static locators ---
    // this.heading = page.getByRole('heading', { name: 'Example' });
    // this.submitButton = page.getByRole('button', { name: 'Submit' });
    // this.nameField = page.getByLabel('Name');

    // --- Dynamic locators (parameterized by data) ---
    // this.itemText = (name) => page.getByText(name);
    // this.itemHeading = (name) => page.getByRole('heading', { name });
  }

  async goto() {
    // await this.page.goto('/example');
  }

  // async submitForm({ name, notes }) {
  //   await this.nameField.fill(name);
  //   if (notes !== undefined) await this.notesField.fill(notes);
  //   await this.submitButton.click();
  // }
}
