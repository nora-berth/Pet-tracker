export class NavComponent {
  constructor(page) {
    this.page = page;
    this.logoutButton = page.getByRole('button', { name: /logout/i });
  }

  async logout() {
    await this.logoutButton.click();
  }

  welcomeText(username) {
    return this.page.getByText(`Welcome, ${username}`);
  }
}
