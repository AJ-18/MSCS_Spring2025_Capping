//
//  HomeView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI

import SwiftUI

struct HomeView: View {
    @Binding var currentView: AppView
    @StateObject private var viewModel = HomeViewModel()
    @Environment(\.sizeCategory) var sizeCategory

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                
                // SPAR title
                HStack {
                    Text(StringConstant.appName)
                        .fontWeight(.heavy)
                        .font(.system(size: 48))
                        .padding(.horizontal, 15)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                    Spacer()
                }

                // Custom Navigation Bar
                HStack {
                    if viewModel.isSearching {
                        HStack {
                            Image(systemName: ImageConstant.magnifyingGlass)
                                .accessibilityLabel(StringConstant.searchIcon)
                            TextField(StringConstant.searchText, text: $viewModel.searchText)
                                .textFieldStyle(PlainTextFieldStyle())
                                .autocorrectionDisabled(true)
                                .submitLabel(.search)
                                .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                            Button(action: {
                                viewModel.cancelSearching()
                            }) {
                                Image(systemName: ImageConstant.xmarkCircleFill)
                                    .foregroundColor(.gray)
                            }
                        }
                        .padding(8)
                        .background(Color(.systemGray5))
                        .cornerRadius(10)
                        .transition(.move(edge: .trailing).combined(with: .opacity))
                    } else {
                        Text(StringConstant.Dashboard)
                            .fontWeight(.heavy)
                            .font(.system(size: 28))
                            .padding(.horizontal, 5)
                            .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                        Spacer()

                        Button(action: {
                            viewModel.startSearching()
                        }) {
                            Image(systemName: ImageConstant.magnifyingGlass)
                                .font(.title2)
                                .padding(.trailing, 10)
                        }
                    }
                }
                .padding(.horizontal)

                // Devices List
                ScrollView {
                    LazyVStack(spacing: 15) {
                        ForEach(viewModel.devices, id: \.id) { device in
                            // Replaced NavigationLink with NavigationButton
                            NavigationButton(title: device.deviceName) {
                                DeviceOptions(currentView: $currentView, device: device) // Pass device to next page
                            }
                            .padding(.horizontal)
                        }
                    }
                    .padding(.top, 10)
                }

                Spacer()
            }
            .padding(.top)
            .navigationBarHidden(true)
            .onAppear {
                self.logPageVisit()
            }
        }
    }
}

#Preview {
    HomeView(currentView: .constant(.home))
}
