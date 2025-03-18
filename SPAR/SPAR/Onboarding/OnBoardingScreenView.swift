//
//  OnBoardingScreenView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI
import OSLog

struct OnBoardingScreenView: View {
    let onboarding: Onboarding
    var showButton: Bool = false
    let logger = Logger.fileLocation
    @Binding var currentView: AppView
    @Environment(\.sizeCategory) var sizeCategory


    var body: some View {
        VStack(spacing: 20) {
            Image(onboarding.imageName)
                .resizable()
                .scaledToFit()
                .frame(height: 300)
                .accessibilityLabel(String(format: StringConstant.onboardingImages, arguments: [onboarding.imageName]))
            Text(onboarding.title)
                .font(.largeTitle)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                
            Text(onboarding.description)
                .font(.body)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
                .minimumScaleFactor(sizeCategory.customMinScaleFactor)

            if showButton {
                Button(action: {
                    // Change to home view when button is tapped
                    currentView = .home
                    logger.info("\(LoggerConstant.getStartedTapped)")
                }) {
                    Text(StringConstant.getstarted)
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .cornerRadius(10)
                        .padding(.horizontal, 40)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                }
            }
        }
    }
}

#Preview {
    OnBoardingScreenView(onboarding: Onboarding(imageName: ImageConstant.welcomeImage, title: StringConstant.welcomeTitle, description: StringConstant.welcomeDescription), currentView: .constant(.onboarding))
}

