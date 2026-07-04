export class SignupPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Sign Up for Pet Tracker' });
    this.username = page.getByLabel(/username/i);
    this.email = page.getByLabel(/email/i);
    this.firstName = page.getByLabel('First Name');
    this.lastName = page.getByLabel('Last Name');
    this.password = page.getByLabel(/^password\s*\*?$/i);
    this.confirmPassword = page.getByLabel(/confirm password/i);
    this.signupButton = page.getByRole('button', { name: /sign up/i });
    this.loginLink = page.getByRole('link', { name: /login/i });
  }

  async goto() {
    await this.page.goto('/signup');
  }

  async signup({ username, email, password, firstName, lastName }) {
    await this.username.fill(username);
    await this.email.fill(email);
    if (firstName) await this.firstName.fill(firstName);
    if (lastName) await this.lastName.fill(lastName);
    await this.password.fill(password);
    await this.confirmPassword.fill(password);
    await this.signupButton.click();
  }

  async signupBasic(username, email, password) {
    await this.username.fill(username);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.confirmPassword.fill(password);
    await this.signupButton.click();
  }
}
