//
//  NetworkService.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation
import Combine

// MARK: - Protocol
protocol NetworkServicing {
    func get<T: Decodable>(from url: URL, token: String?) async throws -> T
    func post<T: Decodable, U: Encodable>(to url: URL, body: U) async throws -> T
}

// MARK: - Implementation
class NetworkService: NetworkServicing {
    private let maxRetryCount = 3
    
    // Generic GET
    func get<T: Decodable>(from url: URL, token: String? = nil) async throws -> T {
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        if let token = token {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            request.addValue("application/json", forHTTPHeaderField: "Accept")

        }
        print("request",request)
        print("Request Headers:", request.allHTTPHeaderFields ?? [:])
        print("Request URL:", request.url?.absoluteString ?? "nil")
        
        return try await perform(request: request)
    }
    
    // Generic POST
    func post<T: Decodable, U: Encodable>(to url: URL, body: U) async throws -> T {
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(body)
        
        return try await perform(request: request)
    }
    
    // MARK: - Private core method with Retry and Exponential Backoff
    private func perform<T: Decodable>(request: URLRequest) async throws -> T {
        var currentRetry = 0
        var delay: Double = 1.0
        
        while currentRetry <= maxRetryCount {
            do {
                let (data, response) = try await URLSession.shared.data(for: request)
                
                guard let httpResponse = response as? HTTPURLResponse,
                      (200...299).contains(httpResponse.statusCode) else {
                    throw URLError(.badServerResponse)
                }
                
                let decodedData = try JSONDecoder().decode(T.self, from: data)
                return decodedData
            } catch {
                if currentRetry == maxRetryCount {
                    throw error
                }
                try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                delay *= 2
                currentRetry += 1
            }
        }
        
        throw URLError(.cannotLoadFromNetwork)
    }
}
