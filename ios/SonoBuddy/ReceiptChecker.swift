import Foundation

struct ReceiptChecker {
    // The first CFBundleVersion (build number) that ships the freemium IAP.
    // Any user whose original App Store purchase was at a lower build number
    // paid for the app itself and should receive premium for free.
    // IMPORTANT: Update this to match your actual first freemium build number.
    private static let freemiumBuild = 10

    static func isLegacyPaidCustomer() -> Bool {
        guard let url = Bundle.main.appStoreReceiptURL,
              FileManager.default.fileExists(atPath: url.path),
              let data = try? Data(contentsOf: url) else {
            return false
        }
        guard let version = extractOriginalAppVersion(from: data) else { return false }
        // original_application_version may be "1.0", "2", "9", etc.
        let major = Int(version.split(separator: ".").first.map(String.init) ?? version) ?? 0
        return major > 0 && major < freemiumBuild
    }

    // Scans the PKCS#7 receipt payload for field type 19 (original_application_version).
    // Each receipt field is: SEQUENCE { INTEGER(type), INTEGER(version=1), OCTET_STRING(value) }
    private static func extractOriginalAppVersion(from data: Data) -> String? {
        let bytes = [UInt8](data)
        var i = 0
        while i + 6 < bytes.count {
            guard bytes[i] == 0x30 else { i += 1; continue }
            let seqStart = i
            i += 1
            i = skipASN1Length(bytes: bytes, from: i)

            // Expect INTEGER for field type
            guard i < bytes.count, bytes[i] == 0x02 else { i = seqStart + 1; continue }
            i += 1
            guard i < bytes.count else { break }
            let typeLen = Int(bytes[i]); i += 1
            guard i + typeLen <= bytes.count else { break }
            var fieldType = 0
            for j in 0..<typeLen { fieldType = (fieldType << 8) | Int(bytes[i + j]) }
            i += typeLen

            guard fieldType == 19 else { i = seqStart + 1; continue }

            // Skip field version INTEGER
            guard i + 2 <= bytes.count, bytes[i] == 0x02 else { i = seqStart + 1; continue }
            i += 1
            let verLen = Int(bytes[i]); i += 1 + verLen

            // OCTET STRING wrapping the actual value
            guard i + 2 <= bytes.count, bytes[i] == 0x04 else { i = seqStart + 1; continue }
            i += 1
            let octetLen = Int(bytes[i]); i += 1
            guard i + octetLen <= bytes.count else { break }
            let octet = bytes[i..<(i + octetLen)]

            // Value is encoded as UTF8String (0x0C) or IA5String (0x16)
            if octet.count >= 2, octet[octet.startIndex] == 0x0C || octet[octet.startIndex] == 0x16 {
                let strLen = Int(octet[octet.startIndex + 1])
                let start = octet.startIndex + 2
                if start + strLen <= octet.endIndex {
                    return String(bytes: Array(octet[start..<(start + strLen)]), encoding: .utf8)
                }
            }
            i = seqStart + 1
        }
        return nil
    }

    private static func skipASN1Length(bytes: [UInt8], from idx: Int) -> Int {
        guard idx < bytes.count else { return idx }
        if bytes[idx] & 0x80 == 0 { return idx + 1 }
        let numBytes = Int(bytes[idx] & 0x7F)
        return idx + 1 + numBytes
    }
}
