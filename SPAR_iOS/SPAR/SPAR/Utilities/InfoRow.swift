//
//  InfoRow.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import SwiftUI

struct InfoRow: View {
    let label: String
    let value: String
    @Environment(\.sizeCategory) var sizeCategory


    var body: some View {
        HStack {
            Text(label)
                .fontWeight(.semibold)
                .foregroundColor(.gray)
                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
            Spacer()
            Text(value)
                .foregroundColor(.black)
                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
        }
    }
}

#Preview {
    InfoRow(label: "User", value: "User123")
}
