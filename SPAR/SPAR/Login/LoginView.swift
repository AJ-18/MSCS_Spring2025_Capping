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

    var body: some View {
        ZStack {
            Color.white
                .ignoresSafeArea()

            BackgroundAnimationView(animate: $viewModel.animate)

            VStack(spacing: 30) {
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

                TextField(StringConstant.Username, text: $viewModel.username)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(15)
                    .foregroundColor(.black)
                    .font(.title2)
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)

                ZStack(alignment: .trailing) {
                    Group {
                        if viewModel.showPassword {
                            TextField(StringConstant.Password, text: $viewModel.password)
                                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                        } else {
                            SecureField(StringConstant.Password, text: $viewModel.password)
                                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
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

                if !viewModel.errorMessage.isEmpty {
                    Text(viewModel.errorMessage)
                        .foregroundColor(.red)
                        .font(.body)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                        .padding(.top, -20)
                }

                Button(action: {
                                   viewModel.submit(currentView: $currentView)
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
                           }
            .padding(40)
        }
        .onAppear {
            viewModel.animate = true
            self.logPageVisit()
                
        }
    }

}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView(currentView: .constant(.login))
    }
}

