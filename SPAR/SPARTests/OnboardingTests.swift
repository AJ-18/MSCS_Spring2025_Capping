//
//  OnboardingTests.swift
//  SPARTests
//
//  Created by Abhijeet Cherungottil on 4/17/25.
//

import XCTest

final class OnboardingTests: XCTestCase {
    let app = XCUIApplication()
    
    override func setUp() {
        continueAfterFailure = false
        app.launch()
    }


    func testGetStartedNavigatesToHome() {
        app.swipeLeft()
        app.swipeLeft()
        app.swipeLeft()
        
        let getStartedButton = app.buttons[StringConstant.getstarted]
        getStartedButton.tap()
        
        XCTAssertTrue(app.staticTexts["Dashboard"].waitForExistence(timeout: 5))
    }
}
