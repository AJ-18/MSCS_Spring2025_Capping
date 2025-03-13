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

    
    var body: some View {
        VStack(spacing: 20) {
            Image(onboarding.imageName)
                .resizable()
                .scaledToFit()
                .frame(height: 300)
            Text(onboarding.title)
                .font(.largeTitle)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
            Text(onboarding.description)
                .font(.body)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            if showButton {
                NavigationLink(destination: HomeView()) {
                    Text("Get Started")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .cornerRadius(10)
                        .padding(.horizontal, 40)
                }.simultaneousGesture(TapGesture().onEnded {
                    logger.info("\(LoggerConstant.getStartedTapped)")
                })
            }
        }
        .onAppear{
            self.logPageVisit()
        }
    }
    
}

#Preview {
    OnBoardingScreenView(onboarding: Onboarding(imageName: ImageConstant.welcomeImage, title: StringConstant.welcomeTitle, description: StringConstant.welcomeDescription))
}

struct Onboarding: Hashable {
    let imageName: String
    let title: String
    let description: String
}
