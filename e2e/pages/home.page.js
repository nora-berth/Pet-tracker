export class HomePage {
  constructor(page) {
    this.page = page;
    this.appTitle = page.getByText('Pet Tracker');
    this.myPetsHeading = page.getByRole('heading', { name: 'My Pets' });
    this.addPetButton = page.getByRole('button', { name: 'Add Pet' });
    this.addPetFormHeading = page.getByRole('heading', { name: 'Add New Pet' });
    this.nameField = page.getByLabel('Name');
    this.speciesField = page.getByLabel('Species');
    this.breedField = page.getByLabel('Breed');
    this.birthDateField = page.getByLabel('Birth Date');
    this.notesField = page.getByLabel('Notes');
    this.submitPetButton = page.getByRole('button', { name: 'Add Pet', exact: true });
    this.emptyStateText = page.getByText(/No pets yet/i);
  }

  async goto() {
    await this.page.goto('/');
  }

  async addPet({ name, species, breed, birthDate, notes }) {
    await this.addPetButton.click();
    await this.nameField.fill(name);
    await this.speciesField.selectOption(species);
    if (breed) await this.breedField.fill(breed);
    if (birthDate) await this.birthDateField.fill(birthDate);
    if (notes) await this.notesField.fill(notes);
    await this.submitPetButton.click();
  }

  async clickPet(name) {
    await this.page.getByRole('heading', { name }).first().click();
  }

  petText(name) {
    return this.page.getByText(name);
  }
}
