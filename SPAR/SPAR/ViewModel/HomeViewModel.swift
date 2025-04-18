//
//  HomeViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/18/25.
//

import Foundation
import SwiftUI

class HomeViewModel: ObservableObject {
    @Published var isSearching = false
    @Published var searchText = ""

    private let allDevices = ["iPhone 15 Pro", "iPad Air", "MacBook Pro", "Apple Watch", "HomePod", "AirPods Pro"]

    var filteredDevices: [String] {
        if searchText.isEmpty {
            return allDevices
        } else {
            return allDevices.filter { $0.localizedCaseInsensitiveContains(searchText) }
        }
    }

    func startSearching() {
        withAnimation {
            isSearching = true
        }
    }

    func cancelSearching() {
        withAnimation {
            isSearching = false
            searchText = ""
        }
    }
}
