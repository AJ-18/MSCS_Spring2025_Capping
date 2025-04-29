//
//  LoginViewUITests.swift
//  SPARTests
//
//  Created by Abhijeet Cherungottil on 4/20/25.
//

import XCTest

final class LoginViewUITests: XCTestCase {

    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments += ["-UITestMode", "-resetDefaults"]
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
    }

    func testLoginWithWrongPassword() throws {
        // Assuming you are starting at LoginView
        while !app.buttons[StringConstant.getstarted].exists {
            app.swipeLeft()
        }
        
        let getStartedButton = app.buttons[StringConstant.getstarted]
        getStartedButton.tap()

        let usernameField = app.textFields["Username"]
        let passwordField = app.secureTextFields["Password"]
        
        XCTAssertTrue(usernameField.exists)
        XCTAssertTrue(passwordField.exists)

        usernameField.tap()
        usernameField.typeText("testuse\"r")

        passwordField.tap()
        passwordField.typeText("wrongpassword")

        app.buttons["Submit"].tap()

        // Wait for the error message to appear
        let errorMessage = app.staticTexts["Username can only contain letters and numbers."]
        let exists = NSPredicate(format: "exists == 1")

        expectation(for: exists, evaluatedWith: errorMessage, handler: nil)
        waitForExpectations(timeout: 5) // <-- YOU NEED THIS
        XCTAssertTrue(errorMessage.exists)
    }

    func testLoginWithCorrectPassword() throws {
        // Assuming correct login changes view, maybe to HomeView or similar
        while !app.buttons[StringConstant.getstarted].exists {
            app.swipeLeft()
        }
        
        
        let getStartedButton = app.buttons[StringConstant.getstarted]
        getStartedButton.tap()

        let usernameField = app.textFields["Username"]
        let passwordField = app.secureTextFields["Password"]
        
        XCTAssertTrue(usernameField.exists)
        XCTAssertTrue(passwordField.exists)

        usernameField.tap()
        usernameField.typeText("user")

        passwordField.tap()
        passwordField.typeText("Password")

        app.buttons["Submit"].tap()

        // After successful login, check for an element that appears ONLY after login
        // Example: a "Welcome" label on HomeView
        
        let homeTitle = app.staticTexts["S.P.A.R"]
        let exists = NSPredicate(format: "exists == 1")

        expectation(for: exists, evaluatedWith: homeTitle, handler: nil)
        waitForExpectations(timeout: 5) 
        XCTAssertTrue(homeTitle.exists)
    }
}

