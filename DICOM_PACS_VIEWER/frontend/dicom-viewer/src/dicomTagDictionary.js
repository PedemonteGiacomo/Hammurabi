export const dicomTagDictionary = {
    "Patient Information": [
        { tag: "x00100010", name: "Patient Name" },
        { tag: "x00100020", name: "Patient ID" },
        { tag: "x00100030", name: "Patient Birth Date" },
        { tag: "x00100040", name: "Patient Sex" }
    ],
    "Study Information": [
        { tag: "x00080020", name: "Study Date" },
        { tag: "x00080030", name: "Study Time" },
        { tag: "x00081030", name: "Study Description" },
        { tag: "x00080050", name: "Accession Number" }
    ],
    "Series Information": [
        { tag: "x00200011", name: "Series Number" },
        { tag: "x0008103E", name: "Series Description" }
    ],
    "Equipment Information": [
        { tag: "x00080070", name: "Manufacturer" },
        { tag: "x00080080", name: "Institution Name" }
    ],
    "Image Information": [
        { tag: "x00080060", name: "Modality" },
        { tag: "x00280010", name: "Rows" },
        { tag: "x00280011", name: "Columns" },
        { tag: "x00280030", name: "Pixel Spacing" },
        { tag: "x00280100", name: "Bits Allocated" }
    ]
};
