export class PetDetailPage {
  constructor(page) {
    this.page = page;
    this.weightSection = page.getByRole('heading', { name: 'Weight Records' }).locator('..');
    this.vaccinationSection = page.getByRole('heading', { name: 'Vaccinations' }).locator('..');
    this.vetVisitSection = page.getByRole('heading', { name: 'Vet Visits' }).locator('..');
    this.deleteButton = page.getByRole('button', { name: 'Delete Pet' });
    this.editButton = page.getByRole('button', { name: 'Edit Pet' });
    this.editFormHeading = page.getByRole('heading', { name: 'Edit Pet' });
  }

  async goto(petId) {
    await this.page.goto(`/pets/${petId}`);
  }

  petNameHeading(petName) {
    return this.page.getByRole('heading', { name: petName, level: 1 });
  }

  async deletePet() {
    this.page.on('dialog', dialog => dialog.accept());
    await this.deleteButton.click();
  }

  async clickEdit() {
    await this.editButton.click();
  }

  async submitEdit({ breed, notes, name, species, birthDate }) {
    if (name !== undefined) {
      await this.page.getByLabel('Name').fill(name);
    }
    if (species !== undefined) {
      await this.page.getByLabel('Species').selectOption(species);
    }
    if (breed !== undefined) {
      await this.page.getByLabel('Breed').fill(breed);
    }
    if (birthDate !== undefined) {
      await this.page.getByLabel('Birth Date').fill(birthDate);
    }
    if (notes !== undefined) {
      await this.page.getByLabel('Notes').fill(notes);
    }
    await this.page.getByRole('button', { name: 'Update Pet' }).click();
  }

  async addWeightRecord({ date, weight, unit, notes }) {
    await this.weightSection.getByRole('button', { name: 'Add' }).click();
    await this.page.getByLabel('Date').fill(date);
    await this.page.getByLabel('Weight').fill(weight);
    if (unit) await this.page.getByLabel('Unit').selectOption(unit);
    if (notes) await this.page.getByLabel('Notes').fill(notes);
    await this.page.getByRole('button', { name: 'Add Weight Record' }).click();
  }

  async addVaccination({ vaccineName, dateAdministered, dueDate, veterinarian, notes }) {
    await this.vaccinationSection.getByRole('button', { name: 'Add' }).click();
    await this.page.getByLabel('Vaccine Name').fill(vaccineName);
    await this.page.getByLabel('Date Administered').fill(dateAdministered);
    if (dueDate) await this.page.getByLabel('Due Date').fill(dueDate);
    if (veterinarian) await this.page.getByLabel('Veterinarian').fill(veterinarian);
    if (notes) await this.page.getByLabel('Notes').fill(notes);
    await this.page.getByRole('button', { name: 'Add Vaccination' }).click();
  }

  async addVetVisit({ visitDate, reason, veterinarian, cost, notes }) {
    await this.vetVisitSection.getByRole('button', { name: 'Add' }).click();
    await this.page.getByLabel('Visit Date').fill(visitDate);
    await this.page.getByLabel('Reason').fill(reason);
    if (veterinarian) await this.page.getByLabel('Veterinarian').fill(veterinarian);
    if (cost) await this.page.getByLabel('Cost').fill(cost);
    if (notes) await this.page.getByLabel('Notes').fill(notes);
    await this.page.getByRole('button', { name: 'Add Vet Visit' }).click();
  }
}
