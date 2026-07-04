export class NavComponent {
  constructor(page) {
    this.logoutButton = page.getByRole('button', { name: /logout/i });

    this.welcomeText = (username) => page.getByText(`Welcome, ${username}`);
  }

  async logout() {
    await this.logoutButton.click();
  }
}
