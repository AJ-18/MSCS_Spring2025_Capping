//
//  DiskIODetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import SwiftUI

import SwiftUI
import Charts

struct DiskIODetailView: View {
    @StateObject private var viewModel = DiskIOViewModel()

    var body: some View {
        ZStack {
            LinearGradient(colors: [.blue.opacity(0.2), .purple.opacity(0.2)], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    Text("Disk I/O Usage")
                        .font(.largeTitle)
                        .bold()
                        .accessibilityAddTraits(.isHeader)

                    Spacer(minLength: 20)

                    // Displaying read and write speeds in a simple chart
                    if let diskIO = viewModel.diskIO {
                        VStack(alignment: .leading, spacing: 16) {
                            InfoRow(label: "Read Speed (MBps)", value: String(format: "%.1f MBps", diskIO.readSpeedMBps))
                            InfoRow(label: "Write Speed (MBps)", value: String(format: "%.1f MBps", diskIO.writeSpeedMBps))
                            InfoRow(label: "Timestamp", value: diskIO.timestamp)

                            Divider().padding(.vertical, 8)

                            Text("Disk I/O Chart")
                                .font(.headline)
                            
                            Chart {
                                BarMark(
                                    x: .value("Read", "Read Speed"),
                                    y: .value("Speed", diskIO.readSpeedMBps)
                                )
                                .foregroundStyle(.green)
                                
                                BarMark(
                                    x: .value("Write", "Write Speed"),
                                    y: .value("Speed", diskIO.writeSpeedMBps)
                                )
                                .foregroundStyle(.red)
                            }
                            .frame(height: 200)
                            .cornerRadius(10)
                            .padding(.top, 8)
                        }
                        .padding()
                        .frame(maxWidth: 360)
                        .background(Color.white)
                        .cornerRadius(16)
                        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 5)
                    }

                    Spacer()
                }
                .padding()
            }
        }
    }
}


#Preview {
    DiskIODetailView()
}
