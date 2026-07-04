export class PetDetailPage {
  constructor(page) {
    this.page = page;

    // Pet detail
    this.deleteButton = page.getByRole('button', { name: 'Delete Pet' });
    this.editButton = page.getByRole('button', { name: 'Edit Pet' });

    // Section headings and containers
    this.weightSection = page.getByRole('heading', { name: 'Weight Records' }).locator('..');
    this.vaccinationSection = page.getByRole('heading', { name: 'Vaccinations' }).locator('..');
    this.vetVisitSection = page.getByRole('heading', { name: 'Vet Visits' }).locator('..');

    // Section add buttons
    this.addWeightButton = this.weightSection.getByRole('button', { name: 'Add' });
    this.addVaccinationButton = this.vaccinationSection.getByRole('button', { name: 'Add' });
    this.addVetVisitButton = this.vetVisitSection.getByRole('button', { name: 'Add' });

    // Edit form
    this.editFormHeading = page.getByRole('heading', { name: 'Edit Pet' });
    this.nameField = page.getByLabel('Name');
    this.speciesField = page.getByLabel('Species');
    this.breedField = page.getByLabel('Breed');
    this.birthDateField = page.getByLabel('Birth Date');
    this.updatePetButton = page.getByRole('button', { name: 'Update Pet' });

    // Weight record form
    this.dateField = page.getByLabel('Date');
    this.weightField = page.getByLabel('Weight');
    this.unitField = page.getByLabel('Unit');
    this.submitWeightButton = page.getByRole('button', { name: 'Add Weight Record' });

    // Vaccination form
    this.vaccineNameField = page.getByLabel('Vaccine Name');
    this.dateAdministeredField = page.getByLabel('Date Administered');
    this.dueDateField = page.getByLabel('Due Date');
    this.submitVaccinationButton = page.getByRole('button', { name: 'Add Vaccination' });

    // Vet visit form
    this.visitDateField = page.getByLabel('Visit Date');
    this.reasonField = page.getByLabel('Reason');
    this.costField = page.getByLabel('Cost');
    this.submitVetVisitButton = page.getByRole('button', { name: 'Add Vet Visit' });

    // Shared across forms
    this.notesField = page.getByLabel('Notes');
    this.veterinarianField = page.getByLabel('Veterinarian');

    // Dynamic locators
    this.petNameHeading = (petName) => page.getByRole('heading', { name: petName, level: 1 });
  }

  async goto(petId) {
    await this.page.goto(`/pets/${petId}`);
  }

  async deletePet() {
    this.page.once('dialog', dialog => dialog.accept());
    await this.deleteButton.click();
  }

  async clickEdit() {
    await this.editButton.click();
  }

  async submitEdit({ breed, notes, name, species, birthDate }) {
    if (name !== undefined) await this.nameField.fill(name);
    if (species !== undefined) await this.speciesField.selectOption(species);
    if (breed !== undefined) await this.breedField.fill(breed);
    if (birthDate !== undefined) await this.birthDateField.fill(birthDate);
    if (notes !== undefined) await this.notesField.fill(notes);
    await this.updatePetButton.click();
  }

  async addWeightRecord({ date, weight, unit, notes }) {
    await this.addWeightButton.click();
    await this.dateField.fill(date);
    await this.weightField.fill(weight);
    if (unit !== undefined) await this.unitField.selectOption(unit);
    if (notes !== undefined) await this.notesField.fill(notes);
    await this.submitWeightButton.click();
  }

  async addVaccination({ vaccineName, dateAdministered, dueDate, veterinarian, notes }) {
    await this.addVaccinationButton.click();
    await this.vaccineNameField.fill(vaccineName);
    await this.dateAdministeredField.fill(dateAdministered);
    if (dueDate !== undefined) await this.dueDateField.fill(dueDate);
    if (veterinarian !== undefined) await this.veterinarianField.fill(veterinarian);
    if (notes !== undefined) await this.notesField.fill(notes);
    await this.submitVaccinationButton.click();
  }

  async addVetVisit({ visitDate, reason, veterinarian, cost, notes }) {
    await this.addVetVisitButton.click();
    await this.visitDateField.fill(visitDate);
    await this.reasonField.fill(reason);
    if (veterinarian !== undefined) await this.veterinarianField.fill(veterinarian);
    if (cost !== undefined) await this.costField.fill(cost);
    if (notes !== undefined) await this.notesField.fill(notes);
    await this.submitVetVisitButton.click();
  }
}
