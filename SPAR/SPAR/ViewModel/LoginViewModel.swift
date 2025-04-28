//
//  LoginViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/18/25.
//

import Foundation
import SwiftUI
import OSLog
import LocalAuthentication


class LoginViewModel: ObservableObject {
    @Published var username: String = ""
    @Published var password: String = ""
    @Published var animate: Bool = false
    @Published var showPassword: Bool = false
    @Published var errorMessage: String = ""

    let logger = Logger.fileLocation
    private let networkManager = NetworkManager()
    
    weak var delegate: LoginViewModelDelegate?
    
    func loginWithFaceID() {
        authenticateWithBiometrics { success in
            if success {
                guard let usernameData = KeychainHelper.read(service: "SPAR", account: "username"),
                      let passwordData = KeychainHelper.read(service: "SPAR", account: "password"),
                      let savedUsername = String(data: usernameData, encoding: .utf8),
                      let savedPassword = String(data: passwordData, encoding: .utf8) else {
                    self.errorMessage = "No saved credentials found."
                    return
                }
                
                Task {
                    do {
                        let response = try await self.networkManager.login(username: savedUsername, password: savedPassword)

                        AppSettings.shared.authToken = response.token
                        AppSettings.shared.userId = response.userId

                        DispatchQueue.main.async {
                            self.delegate?.didLoginSuccessfully()
                        }
                    } catch {
                        DispatchQueue.main.async {
                            self.errorMessage = StringConstant.incorrectCredentials
                        }
                    }
                }
            } else {
                self.errorMessage = "Face ID Authentication Failed."
            }
        }
    }


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
        
//        if username.lowercased() == "user" && password == "Password" {
//            errorMessage = ""
//            self.delegate?.didLoginSuccessfully()
//            print("Login successful!")
//        } else {
//            errorMessage = StringConstant.incorrectCredentials
//        }

        Task {
            do {
                let response = try await networkManager.login(username: username, password: password)
                
                AppSettings.shared.authToken = response.token
                AppSettings.shared.userId = response.userId
                // Save credentials securely
                KeychainHelper.save(Data(username.utf8), service: "SPAR", account: "username")
                KeychainHelper.save(Data(password.utf8), service: "SPAR", account: "password")


                DispatchQueue.main.async {
                    self.delegate?.didLoginSuccessfully()
                }
            } catch {
                DispatchQueue.main.async {
                    self.errorMessage = StringConstant.incorrectCredentials
                }
            }
        }
    }
}

extension LoginViewModel {
    func authenticateWithBiometrics(completion: @escaping (Bool) -> Void) {
        let context = LAContext()
        var error: NSError?

        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            let reason = "Login with Face ID"

            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, authenticationError in
                DispatchQueue.main.async {
                    completion(success)
                }
            }
        } else {
            DispatchQueue.main.async {
                completion(false)
            }
        }
    }
}


protocol LoginViewModelDelegate: AnyObject {
    func didLoginSuccessfully()
}
