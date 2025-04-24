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
    private let networkManager = NetworkManager()
    
    weak var delegate: LoginViewModelDelegate?

    func submit() {
        let isValidUsername = username.range(of: "^[a-zA-Z0-9]+$", options: .regularExpression) != nil
        let disallowedCharacters = CharacterSet(charactersIn: "\"'`;/\\<>")
        let isPasswordSafe = password.rangeOfCharacter(from: disallowedCharacters) == nil

        if !isValidUsername {
            errorMessage = "Username can only contain letters and numbers."
            return
        }

        if !isPasswordSafe {
            errorMessage = "Password contains unsafe characters like \", ', ;, or \\."
            return
        }
        
        if username.lowercased() == "user" && password == "Password" {
            errorMessage = ""
            self.delegate?.didLoginSuccessfully()
            print("Login successful!")
        } else {
            errorMessage = StringConstant.incorrectCredentials
        }

//        Task {
//            do {
//                let response = try await networkManager.login(username: username, password: password)
//                
//                AppSettings.shared.authToken = response.token
//                AppSettings.shared.userId = response.id
//
//                DispatchQueue.main.async {
//                    self.delegate?.didLoginSuccessfully()
//                }
//            } catch {
//                DispatchQueue.main.async {
//                    self.errorMessage = "Invalid credentials or network error."
//                }
//            }
//        }
    }
}



protocol LoginViewModelDelegate: AnyObject {
    func didLoginSuccessfully()
}
