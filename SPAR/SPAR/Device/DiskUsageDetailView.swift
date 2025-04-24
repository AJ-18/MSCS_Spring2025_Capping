//
//  DiskUsageDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import SwiftUI

//
//  DiskUsageDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import SwiftUI

struct DiskUsageDetailView: View {
    @StateObject private var viewModel = DiskUsageViewModel()

    var body: some View {
        ZStack {
            LinearGradient(colors: [.purple.opacity(0.15), .blue.opacity(0.15)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 30) {
                Text("Disk Usage")
                    .font(.largeTitle)
                    .bold()
                    .accessibilityAddTraits(.isHeader)

                // Disk usage donut chart
                HalfDonutChart(chartDataObj: $viewModel.chartData)

                if let diskInfo = viewModel.diskUsage {
                    VStack(alignment: .leading, spacing: 15) {
                        InfoRow(label: "Filesystem", value: diskInfo.filesystem)
                        InfoRow(label: "Total Size", value: String(format: "%.2f GB", diskInfo.sizeGB))
                        InfoRow(label: "Used Space", value: String(format: "%.2f GB", diskInfo.usedGB))
                        InfoRow(label: "Available Space", value: String(format: "%.2f GB", diskInfo.availableGB))
                        InfoRow(label: "Timestamp", value: diskInfo.timestamp)
                    }
                    .padding()
                    .frame(maxWidth: 320)
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)
                } else {
                    Text(viewModel.errorMessage)
                        .foregroundColor(.red)
                        .font(.body)
                }

                Spacer()
            }
            .padding()
        }
    }
}

#Preview {
    DiskUsageDetailView()
}



