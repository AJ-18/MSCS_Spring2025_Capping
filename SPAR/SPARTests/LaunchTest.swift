import XCTest

final class LaunchTest: XCTestCase {
    let app = XCUIApplication()
    
    override func setUp() {
        continueAfterFailure = false
        app.launch()
    }

    func testSplashToOnboardingTransition() {
        let onboardingTitle = app.staticTexts["\(StringConstant.welcomeTitle)"]
        XCTAssertTrue(onboardingTitle.waitForExistence(timeout: 3))
    }
}
