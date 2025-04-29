//
//  LoginView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/18/25.
//

import Foundation
import SwiftUI

struct LoginView: View {
    @Binding var currentView: AppView
    @Environment(\.sizeCategory) var sizeCategory

    @StateObject private var viewModel = LoginViewModel()
    private var coordinator: LoginCoordinator

    init(currentView: Binding<AppView>) {
        self._currentView = currentView
        self.coordinator = LoginCoordinator(currentView: currentView)
    }

    var body: some View {
        ZStack {
            Color.white
                .ignoresSafeArea()

            BackgroundAnimationView(animate: $viewModel.animate)

            VStack(spacing: 30) {
                // Login Header
                VStack(spacing: 5) {
                    Text(StringConstant.welcomeBack)
                        .font(.title3)
                        .foregroundColor(.gray)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                    Text(StringConstant.appName)
                        .font(.system(size: 48, weight: .heavy))
                        .foregroundColor(.blue)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                    Text(StringConstant.login)
                        .font(.title3)
                        .foregroundColor(.gray)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                }
                .padding(.bottom, 20)

                // Username Field
                TextField(StringConstant.Username, text: $viewModel.username)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(15)
                    .foregroundColor(.black)
                    .font(.title2)
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)

                // Password Field
                ZStack(alignment: .trailing) {
                    Group {
                        if viewModel.showPassword {
                            TextField(StringConstant.Password, text: $viewModel.password)
                        } else {
                            SecureField(StringConstant.Password, text: $viewModel.password)
                        }
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(15)
                    .foregroundColor(.black)
                    .font(.title2)

                    Button(action: {
                        viewModel.logger.info("\(LoggerConstant.LoginSubmitTapped)")
                        viewModel.showPassword.toggle()
                    }) {
                        Image(systemName: viewModel.showPassword ? ImageConstant.eyeSlash : ImageConstant.eye)
                            .foregroundColor(.gray)
                            .padding()
                    }
                }

                // Error Message
                if !viewModel.errorMessage.isEmpty {
                    Text(viewModel.errorMessage)
                        .foregroundColor(.red)
                        .font(.body)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                        .padding(.top, -20)
                }

                // Submit Button
                Button(action: {
                    viewModel.submit()
                    viewModel.logger.info("\(LoggerConstant.LoginSubmitTapped)")
                    AppSettings.shared.hasLoggedInOnce = true // Save after first login
                }) {
                    Text(StringConstant.submit)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .font(.title2.bold())
                        .cornerRadius(15)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                        .shadow(radius: 10)
                }
                .accessibilityElement(children: .ignore)
                .accessibilityAddTraits(.isButton)

                // Face ID Button
                if AppSettings.shared.hasLoggedInOnce {
                    Button(action: {
                        viewModel.loginWithFaceID()
                    }) {
                        Image(systemName: "faceid")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 50, height: 50)
                            .padding()
                            .background(Color.blue.opacity(0.5))
                            .foregroundColor(.white)
                            .clipShape(Circle())
                    }
                    .padding(.top, 10)
                    .shadow(radius: 10)
                }
            }
            .padding(40)
        }
        .onAppear {
            viewModel.delegate = coordinator
            viewModel.animate = true
            self.logPageVisit()

            // If already logged in once, automatically trigger FaceID
            if AppSettings.shared.hasLoggedInOnce {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    viewModel.loginWithFaceID()
                }
            }
        }
    }

    private class LoginCoordinator: LoginViewModelDelegate {
        @Binding var currentView: AppView

        init(currentView: Binding<AppView>) {
            self._currentView = currentView
        }

        func didLoginSuccessfully() {
            currentView = .home
        }
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView(currentView: .constant(.login))
    }
}
