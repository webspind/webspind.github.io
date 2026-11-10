/* Officielle satser for indkomståret 2026. Hver værdi står som {v: værdi, src: kilde}.
   Sidst tjekket 10. november 2026. Kommuner: data[navn] = [kommuneskat %, kirkeskat %], kilde i kommuner.src. */
(function (root) {
  root.WS_SATSER = root.WS_SATSER || {};
  root.WS_SATSER[2026] = {
  "aar": 2026,
  "tjekket": "2026-11-10",
  "moms": {
    "sats": {
      "v": 25,
      "src": "https://info.skat.dk/data.aspx?oid=1921136"
    }
  },
  "ferie": {
    "dagePrMaaned": {
      "v": 2.08,
      "src": "https://www.retsinformation.dk/eli/lta/2024/152#P5"
    },
    "dagePrDag": {
      "v": 0.07,
      "src": "https://www.retsinformation.dk/eli/lta/2024/152#P5"
    },
    "maxDageUger": {
      "v": 25,
      "src": "https://www.retsinformation.dk/eli/lta/2024/152#P4"
    },
    "godtgorelsePct": {
      "v": 12.5,
      "src": "https://www.retsinformation.dk/eli/lta/2024/152#P16"
    },
    "godtgorelseValgfriPct": {
      "v": 12,
      "src": "https://www.retsinformation.dk/eli/lta/2024/152#P16"
    },
    "tillaegPct": {
      "v": 1,
      "src": "https://www.retsinformation.dk/eli/lta/2024/152#P16"
    },
    "arbejdsdageAar": {
      "v": 260,
      "src": "Forenkling: 5 dage x 52 uger, kun til at anslå løn under ferie (ferieloven § 17: sædvanlig løn)"
    }
  },
  "koersel": {
    "gratisKm": {
      "v": 24,
      "src": "https://www.retsinformation.dk/eli/lta/2025/1333"
    },
    "knaekKm": {
      "v": 120,
      "src": "https://www.retsinformation.dk/eli/lta/2025/1333"
    },
    "sats25_120": {
      "v": 3.17,
      "src": "https://skat.dk/borger/fradrag/koerselsfradrag/beregn-dit-koerselsfradrag"
    },
    "satsOver120": {
      "v": 1.59,
      "src": "https://skat.dk/borger/fradrag/koerselsfradrag/beregn-dit-koerselsfradrag"
    },
    "satsYder": {
      "v": 3.51,
      "src": "https://info.skat.dk/data.aspx?oid=2061744"
    },
    "tillaegPct": {
      "v": 64,
      "src": "https://www.retsinformation.dk/eli/lta/2026/616"
    },
    "tillaegAftrapPct": {
      "v": 1.28,
      "src": "https://www.retsinformation.dk/eli/lta/2026/616"
    },
    "tillaegAftrapLoftPct": {
      "v": 2,
      "src": "https://www.retsinformation.dk/eli/lta/2026/616"
    },
    "tillaegGraense": {
      "v": 341500,
      "src": "https://svmn.dk/tal-og-metode/satser/regulering-af-beloebsgraenser/beloebsgraenser-i-skattelovgivningen-der-reguleres-efter-personskattelovens-20-2026-2027"
    },
    "tillaegMaks": {
      "v": 30800,
      "src": "https://skat.dk/borger/fradrag/koerselsfradrag/beregn-dit-koerselsfradrag"
    },
    "broer": {
      "storebaeltBil": {
        "v": 110,
        "src": "https://skat.dk/borger/fradrag/koerselsfradrag/beregn-dit-koerselsfradrag"
      },
      "storebaeltTog": {
        "v": 15,
        "src": "https://skat.dk/borger/fradrag/koerselsfradrag/beregn-dit-koerselsfradrag"
      },
      "oresundBil": {
        "v": 50,
        "src": "https://skat.dk/borger/fradrag/koerselsfradrag/beregn-dit-koerselsfradrag"
      },
      "oresundTog": {
        "v": 8,
        "src": "https://skat.dk/borger/fradrag/koerselsfradrag/beregn-dit-koerselsfradrag"
      }
    },
    "yderkommuner": {
      "v": [
        "Bornholm",
        "Brønderslev",
        "Frederikshavn",
        "Faaborg-Midtfyn",
        "Guldborgsund",
        "Hjørring",
        "Jammerbugt",
        "Langeland",
        "Lolland",
        "Læsø",
        "Morsø",
        "Norddjurs",
        "Odsherred",
        "Samsø",
        "Skive",
        "Slagelse",
        "Struer",
        "Svendborg",
        "Sønderborg",
        "Thisted",
        "Tønder",
        "Vesthimmerlands",
        "Vordingborg",
        "Ærø",
        "Aabenraa"
      ],
      "src": "https://info.skat.dk/data.aspx?oid=2061744"
    },
    "smaaoeer": {
      "v": [
        "Bågø",
        "Egholm",
        "Endelave",
        "Hjarnø",
        "Mandø",
        "Nekselø",
        "Orø",
        "Sejerø",
        "Tunø",
        "Årø"
      ],
      "src": "https://info.skat.dk/data.aspx?oid=2061744"
    }
  },
  "am": {
    "sats": {
      "v": 8,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/arbejdsmarkedsbidragsloven"
    }
  },
  "personskat": {
    "personfradrag": {
      "v": 54100,
      "src": "https://svmn.dk/tal-og-metode/satser/regulering-af-beloebsgraenser/beloebsgraenser-i-skattelovgivningen-der-reguleres-efter-personskattelovens-20-2026-2027"
    },
    "bundPct": {
      "v": 12.01,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven"
    },
    "mellemPct": {
      "v": 7.5,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven"
    },
    "mellemGraense": {
      "v": 641200,
      "src": "https://skat.dk/hjaelp/bundskat-mellemskat-topskat-og-toptopskat"
    },
    "topPct": {
      "v": 7.5,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven"
    },
    "topGraense": {
      "v": 777900,
      "src": "https://skat.dk/hjaelp/bundskat-mellemskat-topskat-og-toptopskat"
    },
    "toptopPct": {
      "v": 5,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven"
    },
    "toptopGraense": {
      "v": 2592700,
      "src": "https://skat.dk/hjaelp/bundskat-mellemskat-topskat-og-toptopskat"
    },
    "skatteloftPct": {
      "v": 44.57,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven"
    }
  },
  "ligning": {
    "beskPct": {
      "v": 12.75,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/ligningsloven"
    },
    "beskMaks": {
      "v": 63300,
      "src": "https://info.skat.dk/data.aspx?oid=2273718"
    },
    "enligPct": {
      "v": 11.5,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/ligningsloven"
    },
    "enligMaks": {
      "v": 50600,
      "src": "https://info.skat.dk/data.aspx?oid=2273718"
    },
    "jobPct": {
      "v": 4.5,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/ligningsloven"
    },
    "jobGraense": {
      "v": 235200,
      "src": "https://info.skat.dk/data.aspx?oid=2273725"
    },
    "jobMaks": {
      "v": 3100,
      "src": "https://info.skat.dk/data.aspx?oid=2273725"
    }
  },
  "gnsKommune": {
    "v": 25.05,
    "src": "https://www.statistikbanken.dk/PSKAT"
  },
  "kommuner": {
    "src": "https://www.statistikbanken.dk/PSKAT",
    "data": {
      "Aabenraa": [
        25.6,
        0.95
      ],
      "Aalborg": [
        25.6,
        0.98
      ],
      "Aarhus": [
        24.52,
        0.74
      ],
      "Albertslund": [
        25.6,
        0.8
      ],
      "Allerød": [
        25.3,
        0.58
      ],
      "Assens": [
        26.1,
        0.98
      ],
      "Ballerup": [
        25.5,
        0.75
      ],
      "Billund": [
        24.0,
        0.89
      ],
      "Bornholm": [
        26.2,
        0.93
      ],
      "Brøndby": [
        24.3,
        0.8
      ],
      "Brønderslev": [
        26.3,
        1.06
      ],
      "Dragør": [
        24.8,
        0.61
      ],
      "Egedal": [
        25.7,
        0.76
      ],
      "Esbjerg": [
        26.1,
        0.81
      ],
      "Faaborg-Midtfyn": [
        26.1,
        1.05
      ],
      "Fanø": [
        26.1,
        1.14
      ],
      "Favrskov": [
        25.7,
        0.96
      ],
      "Faxe": [
        25.8,
        1.08
      ],
      "Fredensborg": [
        25.3,
        0.64
      ],
      "Fredericia": [
        25.5,
        0.88
      ],
      "Frederiksberg": [
        24.5,
        0.5
      ],
      "Frederikshavn": [
        26.2,
        1.03
      ],
      "Frederikssund": [
        25.6,
        0.96
      ],
      "Furesø": [
        24.88,
        0.7
      ],
      "Gentofte": [
        24.14,
        0.38
      ],
      "Gladsaxe": [
        23.6,
        0.75
      ],
      "Glostrup": [
        24.6,
        0.8
      ],
      "Greve": [
        24.59,
        0.81
      ],
      "Gribskov": [
        25.4,
        0.85
      ],
      "Guldborgsund": [
        25.8,
        1.16
      ],
      "Haderslev": [
        26.3,
        0.95
      ],
      "Halsnæs": [
        25.7,
        0.85
      ],
      "Hedensted": [
        25.52,
        0.98
      ],
      "Helsingør": [
        25.82,
        0.63
      ],
      "Herlev": [
        23.7,
        0.8
      ],
      "Herning": [
        25.4,
        0.99
      ],
      "Hillerød": [
        25.6,
        0.69
      ],
      "Hjørring": [
        26.21,
        1.19
      ],
      "Holbæk": [
        25.3,
        0.96
      ],
      "Holstebro": [
        25.5,
        1.08
      ],
      "Horsens": [
        25.69,
        0.79
      ],
      "Hvidovre": [
        25.4,
        0.72
      ],
      "Høje-Taastrup": [
        24.6,
        0.8
      ],
      "Hørsholm": [
        23.7,
        0.62
      ],
      "Ikast-Brande": [
        25.1,
        0.97
      ],
      "Ishøj": [
        25.0,
        0.9
      ],
      "Jammerbugt": [
        25.7,
        1.2
      ],
      "Kalundborg": [
        24.2,
        1.01
      ],
      "Kerteminde": [
        26.1,
        0.98
      ],
      "Kolding": [
        25.5,
        0.92
      ],
      "København": [
        23.39,
        0.8
      ],
      "Køge": [
        25.26,
        0.87
      ],
      "Langeland": [
        26.3,
        1.14
      ],
      "Lejre": [
        25.31,
        1.05
      ],
      "Lemvig": [
        25.7,
        1.27
      ],
      "Lolland": [
        26.3,
        1.23
      ],
      "Lyngby-Taarbæk": [
        24.38,
        0.6
      ],
      "Læsø": [
        26.3,
        1.3
      ],
      "Mariagerfjord": [
        25.9,
        1.15
      ],
      "Middelfart": [
        25.8,
        0.9
      ],
      "Morsø": [
        25.8,
        1.2
      ],
      "Norddjurs": [
        26.0,
        1.0
      ],
      "Nordfyns": [
        26.0,
        1.04
      ],
      "Nyborg": [
        26.3,
        1.0
      ],
      "Næstved": [
        25.0,
        0.98
      ],
      "Odder": [
        25.1,
        0.95
      ],
      "Odense": [
        25.5,
        0.68
      ],
      "Odsherred": [
        26.3,
        0.98
      ],
      "Randers": [
        26.0,
        0.89
      ],
      "Rebild": [
        25.83,
        1.2
      ],
      "Ringkøbing-Skjern": [
        25.0,
        1.05
      ],
      "Ringsted": [
        26.1,
        0.95
      ],
      "Roskilde": [
        25.2,
        0.84
      ],
      "Rudersdal": [
        23.47,
        0.57
      ],
      "Rødovre": [
        25.7,
        0.72
      ],
      "Samsø": [
        25.9,
        1.2
      ],
      "Silkeborg": [
        25.5,
        0.94
      ],
      "Skanderborg": [
        26.0,
        0.86
      ],
      "Skive": [
        25.5,
        1.09
      ],
      "Slagelse": [
        26.1,
        0.96
      ],
      "Solrød": [
        24.99,
        0.84
      ],
      "Sorø": [
        26.3,
        0.95
      ],
      "Stevns": [
        26.0,
        1.1
      ],
      "Struer": [
        25.3,
        1.2
      ],
      "Svendborg": [
        26.3,
        1.02
      ],
      "Syddjurs": [
        25.9,
        0.98
      ],
      "Sønderborg": [
        25.7,
        0.91
      ],
      "Thisted": [
        25.5,
        1.27
      ],
      "Tårnby": [
        24.1,
        0.61
      ],
      "Tønder": [
        25.3,
        1.16
      ],
      "Vallensbæk": [
        25.6,
        0.8
      ],
      "Varde": [
        25.1,
        0.95
      ],
      "Vejen": [
        25.8,
        1.06
      ],
      "Vejle": [
        23.4,
        0.89
      ],
      "Vesthimmerlands": [
        26.3,
        1.18
      ],
      "Viborg": [
        25.5,
        0.93
      ],
      "Vordingborg": [
        26.3,
        1.02
      ],
      "Ærø": [
        26.1,
        1.07
      ]
    }
  }
};
})(typeof window !== "undefined" ? window : globalThis);
