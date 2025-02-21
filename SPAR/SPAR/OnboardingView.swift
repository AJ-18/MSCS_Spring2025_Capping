//
//  OnboardingView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI

struct OnboardingView: View {
    @State private var currentPage = 0
    
    var body: some View {
        TabView(selection: $currentPage){
            OnBoardingScreenView(onboarding: Onboarding(imageName: ImageConstant.welcomeImage, title: StringConstant.welcomeTitle, description: StringConstant.welcomeDescription))
                .tag(0)
            OnBoardingScreenView(onboarding: Onboarding(imageName: ImageConstant.stopwatchImage, title: StringConstant.cpuTrackingTitle, description: StringConstant.cpuTrackingDescription))
                .tag(1)
            OnBoardingScreenView(onboarding: Onboarding(imageName: ImageConstant.mobileNotificationImage, title: StringConstant.alertsTitle, description: StringConstant.alertsDescription))
                .tag(2)
            OnBoardingScreenView(onboarding: Onboarding(imageName: ImageConstant.laptopGraphImage, title: StringConstant.desktopRequirementTitle, description: StringConstant.desktopRequirementDescription),showButton: true)
                .tag(3)
        }
        .tabViewStyle(.page(indexDisplayMode: .always))
        .indexViewStyle(.page(backgroundDisplayMode: .always))
    }
}

#Preview {
    OnboardingView()
}
