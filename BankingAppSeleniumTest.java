import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Sample Selenium Test for SecureBank Banking Application
 * 
 * This demonstrates various test scenarios and best practices for
 * automating the banking application.
 */
public class BankingAppSeleniumTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private static final String BASE_URL = "http://localhost:8080";

    public void setUp() {
        // Setup ChromeDriver
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    /**
     * Test Case 1: Successful Login
     */
    public void testSuccessfulLogin() {
        System.out.println("Test 1: Testing successful login...");
        
        driver.get(BASE_URL);
        
        // Find elements using multiple locator strategies
        WebElement username = driver.findElement(By.id("username"));
        // Alternative: By.cssSelector("[data-testid='username-input']")
        
        WebElement password = driver.findElement(By.id("password"));
        // Alternative: By.cssSelector("[data-testid='password-input']")
        
        WebElement loginButton = driver.findElement(By.id("login-button"));
        // Alternative: By.cssSelector("[data-testid='login-button']")
        
        // Enter credentials
        username.sendKeys("john.doe");
        password.sendKeys("welcome_123");
        loginButton.click();
        
        // Wait for redirect to dashboard
        wait.until(ExpectedConditions.urlContains("dashboard.html"));
        
        // Verify we're on dashboard
        WebElement welcomeMessage = wait.until(
            ExpectedConditions.presenceOfElementLocated(By.id("welcome-message"))
        );
        
        String welcomeText = welcomeMessage.getText();
        System.out.println("✓ Login successful! " + welcomeText);
        assert welcomeText.contains("Welcome, John");
    }

    /**
     * Test Case 2: Failed Login with Invalid Credentials
     */
    public void testFailedLogin() {
        System.out.println("\nTest 2: Testing failed login...");
        
        driver.get(BASE_URL);
        
        WebElement username = driver.findElement(By.id("username"));
        WebElement password = driver.findElement(By.id("password"));
        WebElement loginButton = driver.findElement(By.id("login-button"));
        
        username.sendKeys("invalid.user");
        password.sendKeys("wrongpassword");
        loginButton.click();
        
        // Wait for error message to appear
        WebElement errorMessage = wait.until(
            ExpectedConditions.visibilityOfElementLocated(By.id("error-message"))
        );
        
        String errorText = errorMessage.getText();
        System.out.println("✓ Error message displayed: " + errorText);
        assert errorText.contains("Invalid username or password");
    }

    /**
     * Test Case 3: Dashboard Account Balances
     */
    public void testDashboardBalances() {
        System.out.println("\nTest 3: Verifying account balances...");
        
        // Login first
        performLogin("john.doe", "welcome_123");
        
        // Verify account balances are displayed
        WebElement checkingBalance = wait.until(
            ExpectedConditions.presenceOfElementLocated(By.id("checking-balance"))
        );
        WebElement savingsBalance = driver.findElement(By.id("savings-balance"));
        WebElement creditBalance = driver.findElement(By.id("credit-balance"));
        
        System.out.println("✓ Checking Balance: " + checkingBalance.getText());
        System.out.println("✓ Savings Balance: " + savingsBalance.getText());
        System.out.println("✓ Credit Balance: " + creditBalance.getText());
        
        assert checkingBalance.getText().contains("$");
        assert savingsBalance.getText().contains("$");
    }

    /**
     * Test Case 4: Navigation Between Pages
     */
    public void testNavigation() {
        System.out.println("\nTest 4: Testing navigation...");
        
        performLogin("john.doe", "welcome_123");
        
        // Navigate to Transfer page
        WebElement transferNav = driver.findElement(
            By.cssSelector("[data-testid='nav-transfer']")
        );
        transferNav.click();
        wait.until(ExpectedConditions.urlContains("transfer.html"));
        System.out.println("✓ Navigated to Transfer page");
        
        // Navigate to Transactions page
        WebElement transactionsNav = driver.findElement(
            By.cssSelector("[data-testid='nav-transactions']")
        );
        transactionsNav.click();
        wait.until(ExpectedConditions.urlContains("transactions.html"));
        System.out.println("✓ Navigated to Transactions page");
        
        // Navigate to Profile page
        WebElement profileNav = driver.findElement(
            By.cssSelector("[data-testid='nav-profile']")
        );
        profileNav.click();
        wait.until(ExpectedConditions.urlContains("profile.html"));
        System.out.println("✓ Navigated to Profile page");
        
        // Navigate back to Dashboard
        WebElement dashboardNav = driver.findElement(
            By.cssSelector("[data-testid='nav-dashboard']")
        );
        dashboardNav.click();
        wait.until(ExpectedConditions.urlContains("dashboard.html"));
        System.out.println("✓ Navigated back to Dashboard");
    }

    /**
     * Test Case 5: Transfer Money Flow
     */
    public void testMoneyTransfer() {
        System.out.println("\nTest 5: Testing money transfer...");
        
        performLogin("john.doe", "welcome_123");
        
        // Navigate to transfer page
        driver.findElement(By.cssSelector("[data-testid='nav-transfer']")).click();
        wait.until(ExpectedConditions.urlContains("transfer.html"));
        
        // Fill transfer form
        Select fromAccount = new Select(driver.findElement(By.id("from-account")));
        Select toAccount = new Select(driver.findElement(By.id("to-account")));
        WebElement amount = driver.findElement(By.id("amount"));
        WebElement description = driver.findElement(By.id("description"));
        
        fromAccount.selectByValue("checking");
        toAccount.selectByValue("savings");
        amount.sendKeys("100.00");
        description.sendKeys("Test transfer via Selenium");
        
        System.out.println("✓ Transfer form filled");
        
        // Submit form
        WebElement submitButton = driver.findElement(By.id("submit-transfer"));
        submitButton.click();
        
        // Wait for confirmation modal
        WebElement confirmModal = wait.until(
            ExpectedConditions.visibilityOfElementLocated(By.id("confirmation-modal"))
        );
        System.out.println("✓ Confirmation modal appeared");
        
        // Verify transfer details in modal
        WebElement confirmAmount = driver.findElement(By.id("confirm-amount"));
        assert confirmAmount.getText().equals("$100.00");
        
        // Confirm transfer
        WebElement confirmButton = driver.findElement(By.id("confirm-transfer"));
        confirmButton.click();
        
        // Wait for redirect to dashboard
        wait.until(ExpectedConditions.urlContains("dashboard.html"));
        
        // Verify success message
        WebElement successMessage = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("[data-testid='success-message']")
            )
        );
        
        System.out.println("✓ Transfer completed: " + successMessage.getText());
        assert successMessage.getText().contains("successfully");
    }

    /**
     * Test Case 6: Transaction Filtering
     */
    public void testTransactionFiltering() {
        System.out.println("\nTest 6: Testing transaction filtering...");
        
        performLogin("john.doe", "welcome_123");
        
        // Navigate to transactions
        driver.findElement(By.cssSelector("[data-testid='nav-transactions']")).click();
        wait.until(ExpectedConditions.urlContains("transactions.html"));
        
        // Apply filters
        Select accountFilter = new Select(driver.findElement(By.id("filter-account")));
        Select typeFilter = new Select(driver.findElement(By.id("filter-type")));
        
        accountFilter.selectByValue("checking");
        typeFilter.selectByValue("deposit");
        
        WebElement applyButton = driver.findElement(By.id("apply-filters"));
        applyButton.click();
        
        // Wait for table to update
        wait.until(ExpectedConditions.presenceOfElementLocated(
            By.cssSelector("[data-testid='full-transactions-body'] tr")
        ));
        
        System.out.println("✓ Filters applied successfully");
        
        // Reset filters
        WebElement resetButton = driver.findElement(By.id("reset-filters"));
        resetButton.click();
        System.out.println("✓ Filters reset successfully");
    }

    /**
     * Test Case 7: Profile Update
     */
    public void testProfileUpdate() {
        System.out.println("\nTest 7: Testing profile update...");
        
        performLogin("john.doe", "welcome_123");
        
        // Navigate to profile
        driver.findElement(By.cssSelector("[data-testid='nav-profile']")).click();
        wait.until(ExpectedConditions.urlContains("profile.html"));
        
        // Update phone number
        WebElement phoneInput = driver.findElement(By.id("phone"));
        phoneInput.clear();
        phoneInput.sendKeys("555-999-8888");
        
        // Save changes
        WebElement saveButton = driver.findElement(By.id("save-profile"));
        saveButton.click();
        
        // Wait for success message
        WebElement successMessage = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("[data-testid='success-message']")
            )
        );
        
        System.out.println("✓ Profile updated: " + successMessage.getText());
        assert successMessage.getText().contains("successfully");
    }

    /**
     * Test Case 8: Notification Preferences
     */
    public void testNotificationPreferences() {
        System.out.println("\nTest 8: Testing notification preferences...");
        
        performLogin("john.doe", "welcome_123");
        
        // Navigate to profile
        driver.findElement(By.cssSelector("[data-testid='nav-profile']")).click();
        wait.until(ExpectedConditions.urlContains("profile.html"));
        
        // Toggle checkboxes
        WebElement emailNotifications = driver.findElement(By.id("email-notifications"));
        WebElement marketingEmails = driver.findElement(By.id("marketing-emails"));
        
        boolean wasChecked = marketingEmails.isSelected();
        marketingEmails.click();
        
        // Save preferences
        WebElement saveButton = driver.findElement(By.id("save-notifications"));
        saveButton.click();
        
        // Wait for success
        WebElement successMessage = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("[data-testid='success-message']")
            )
        );
        
        System.out.println("✓ Preferences saved: " + successMessage.getText());
    }

    /**
     * Test Case 9: Pagination
     */
    public void testPagination() {
        System.out.println("\nTest 9: Testing pagination...");
        
        performLogin("john.doe", "welcome_123");
        
        // Navigate to transactions
        driver.findElement(By.cssSelector("[data-testid='nav-transactions']")).click();
        wait.until(ExpectedConditions.urlContains("transactions.html"));
        
        // Check page info
        WebElement pageInfo = driver.findElement(By.id("page-info"));
        System.out.println("✓ Current page: " + pageInfo.getText());
        
        // Try next page button
        WebElement nextButton = driver.findElement(By.id("next-page"));
        if (nextButton.isEnabled()) {
            nextButton.click();
            wait.until(ExpectedConditions.textToBePresentInElement(pageInfo, "Page 2"));
            System.out.println("✓ Navigated to next page");
            
            // Go back
            WebElement prevButton = driver.findElement(By.id("prev-page"));
            prevButton.click();
            wait.until(ExpectedConditions.textToBePresentInElement(pageInfo, "Page 1"));
            System.out.println("✓ Navigated to previous page");
        } else {
            System.out.println("✓ Only one page of transactions");
        }
    }

    /**
     * Test Case 10: Logout
     */
    public void testLogout() {
        System.out.println("\nTest 10: Testing logout...");
        
        performLogin("john.doe", "welcome_123");
        
        WebElement logoutButton = driver.findElement(By.id("logout-button"));
        logoutButton.click();
        
        // Wait for redirect to login page
        wait.until(ExpectedConditions.urlContains("index.html"));
        
        // Verify we're back at login
        WebElement loginForm = wait.until(
            ExpectedConditions.presenceOfElementLocated(By.id("login-form"))
        );
        
        System.out.println("✓ Successfully logged out");
        assert loginForm.isDisplayed();
    }

    // Helper method
    private void performLogin(String username, String password) {
        driver.get(BASE_URL);
        driver.findElement(By.id("username")).sendKeys(username);
        driver.findElement(By.id("password")).sendKeys(password);
        driver.findElement(By.id("login-button")).click();
        wait.until(ExpectedConditions.urlContains("dashboard.html"));
    }

    // Main method to run all tests
    public static void main(String[] args) {
        BankingAppSeleniumTest test = new BankingAppSeleniumTest();
        
        try {
            test.setUp();
            System.out.println("=== SecureBank Selenium Test Suite ===\n");
            
            test.testSuccessfulLogin();
            test.tearDown();
            
            test.setUp();
            test.testFailedLogin();
            test.tearDown();
            
            test.setUp();
            test.testDashboardBalances();
            test.tearDown();
            
            test.setUp();
            test.testNavigation();
            test.tearDown();
            
            test.setUp();
            test.testMoneyTransfer();
            test.tearDown();
            
            test.setUp();
            test.testTransactionFiltering();
            test.tearDown();
            
            test.setUp();
            test.testProfileUpdate();
            test.tearDown();
            
            test.setUp();
            test.testNotificationPreferences();
            test.tearDown();
            
            test.setUp();
            test.testPagination();
            test.tearDown();
            
            test.setUp();
            test.testLogout();
            test.tearDown();
            
            System.out.println("\n=== All Tests Passed! ===");
            
        } catch (Exception e) {
            System.err.println("Test failed: " + e.getMessage());
            e.printStackTrace();
            test.tearDown();
        }
    }
}
