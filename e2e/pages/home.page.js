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
    this.photoInput = page.getByLabel('Photo');
    this.emptyStateText = page.getByText(/No pets yet/i);

    this.petHeading = (name) => page.getByRole('heading', { name }).first();
    this.petText = (name) => page.getByText(name);
  }

  async goto() {
    await this.page.goto('/');
  }

  async addPet({ name, species, breed, birthDate, notes, photoPath }) {
    await this.addPetButton.click();
    await this.nameField.fill(name);
    await this.speciesField.selectOption(species);
    if (breed !== undefined) await this.breedField.fill(breed);
    if (birthDate !== undefined) await this.birthDateField.fill(birthDate);
    if (photoPath !== undefined) await this.photoInput.setInputFiles(photoPath);
    if (notes !== undefined) await this.notesField.fill(notes);
    await this.submitPetButton.click();
  }

  async clickPet(name) {
    await this.petHeading(name).click();
  }
}
