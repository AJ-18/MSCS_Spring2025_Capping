//
//  HomeView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI

struct HomeView: View {
    @Binding var currentView: AppView
    @StateObject private var viewModel = HomeViewModel()
    @Environment(\.sizeCategory) var sizeCategory

    var body: some View {
        NavigationStack {
            ZStack {
                BackgroundAnimationView(animate: $viewModel.animate)

                VStack(spacing: 20) {
                    // SPAR title
                    HStack {
                        Text(StringConstant.appName)
                            .fontWeight(.heavy)
                            .font(.system(size: 48))
                            .padding(.horizontal, 15)
                            .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                        Spacer()
                        // 🚪 Sign Out Button
                          Button(action: {
                              viewModel.signOut(currentView: $currentView)
                          }) {
                              Image(systemName: ImageConstant.logout)
                                  .font(.title2)
                                  .foregroundColor(.red)
                                  .padding(.trailing, 10)
                                  .accessibilityLabel(AccessibilityConstant.signOut)
                          }
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
                            ForEach(viewModel.filteredDevices, id: \.id) { device in
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
                    viewModel.getDeviceData()
                }

                // Show download popup when no devices are available
                if viewModel.showDownloadPopup {
                    VStack {
                        Spacer(minLength: 200)

                        // Cool empty state
                        VStack {
                            Image(systemName: ImageConstant.emptyScreenlogo)
                                .font(.system(size: 70))
                                .foregroundColor(.blue)
                                .scaleEffect(1.2)
                                .opacity(0.8)
                                .animation(.easeInOut(duration: 1).repeatForever(autoreverses: true), value: viewModel.showDownloadPopup)
                            
                            Text(StringConstant.emptyscreenmsg)
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.primary)
                                .multilineTextAlignment(.center)
                                .padding(.top, 20)
                                .opacity(0.9)
                                .scaleEffect(viewModel.showDownloadPopup ? 1 : 1.05)
                                .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: viewModel.showDownloadPopup)
                            
                            Text(StringConstant.downloadApp)
                                .font(.system(size: 20, weight: .semibold))
                                .foregroundColor(.blue)
                                .underline()
                                .onTapGesture {
                                    // Action to download SPAR Desktop
                                    // You can trigger URL to download or show info here
                                }
                                .padding(.top, 10)

                            Spacer()
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding(40)
                        .transition(.opacity)
                    }
                }
            }
        }
    }
}

#Preview {
    HomeView(currentView: .constant(.home))
}
