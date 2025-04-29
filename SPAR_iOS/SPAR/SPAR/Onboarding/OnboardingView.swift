//
//  OnboardingView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI
struct OnboardingView: View {
    @Binding var currentView: AppView

    var body: some View {
        TabView {
            OnBoardingScreenView(onboarding: Onboarding(imageName: ImageConstant.welcomeImage, title: StringConstant.welcomeTitle, description: StringConstant.welcomeDescription), currentView: $currentView)
            OnBoardingScreenView(onboarding: Onboarding(imageName: ImageConstant.stopwatchImage, title: StringConstant.cpuTrackingTitle, description: StringConstant.cpuTrackingDescription), currentView: $currentView)
            OnBoardingScreenView(onboarding: Onboarding(imageName: ImageConstant.mobileNotificationImage, title: StringConstant.alertsTitle, description: StringConstant.alertsDescription), currentView: $currentView)
            OnBoardingScreenView(onboarding: Onboarding(imageName: ImageConstant.laptopGraphImage, title: StringConstant.desktopRequirementTitle, description: StringConstant.desktopRequirementDescription), showButton: true, currentView: $currentView)
        }
        .tabViewStyle(.page(indexDisplayMode: .always))
        .indexViewStyle(.page(backgroundDisplayMode: .always))
        .onAppear{
            self.logPageVisit()
        }
    }
}


#Preview {
    OnboardingView(currentView: .constant(.onboarding))
}
