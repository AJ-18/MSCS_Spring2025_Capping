//
//  LoginViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/18/25.
//

import Foundation
import SwiftUI
import OSLog

class LoginViewModel: ObservableObject {
    @Published var username: String = ""
    @Published var password: String = ""
    @Published var animate: Bool = false
    @Published var showPassword: Bool = false
    @Published var errorMessage: String = ""
    let logger = Logger.fileLocation


    func submit(currentView: Binding<AppView>) {
        if username.lowercased() == "user" && password == "Password" {
            errorMessage = ""
            currentView.wrappedValue = .home
            print("Login successful!")
        } else {
            errorMessage = StringConstant.incorrectCredentials
        }
    }
}
