/* Officielle satser for indkomståret 2027. Hver værdi står som {v: værdi, src: kilde}.
   Sidst tjekket 10. november 2026. Kommuner: data[navn] = [kommuneskat %, kirkeskat %], kilde i kommuner.src. */
(function (root) {
  root.WS_SATSER = root.WS_SATSER || {};
  root.WS_SATSER[2027] = {
  "aar": 2027,
  "tjekket": "2026-11-10",
  "bemaerkning": "2027-tallene er offentliggjort af Skatte- og Vækstministeriet 27. august 2026 og kan ændres, hvis Folketinget vedtager noget nyt.",
  "am": {
    "sats": {
      "v": 8,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/arbejdsmarkedsbidragsloven"
    }
  },
  "personskat": {
    "personfradrag": {
      "v": 55700,
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
      "v": 659900,
      "src": "https://svmn.dk/tal-og-metode/satser/regulering-af-beloebsgraenser/beloebsgraenser-i-skattelovgivningen-der-reguleres-efter-personskattelovens-20-2026-2027"
    },
    "topPct": {
      "v": 7.5,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven"
    },
    "topGraense": {
      "v": 800500,
      "src": "https://svmn.dk/tal-og-metode/satser/regulering-af-beloebsgraenser/beloebsgraenser-i-skattelovgivningen-der-reguleres-efter-personskattelovens-20-2026-2027"
    },
    "toptopPct": {
      "v": 5,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven"
    },
    "toptopGraense": {
      "v": 2668200,
      "src": "https://svmn.dk/tal-og-metode/satser/regulering-af-beloebsgraenser/beloebsgraenser-i-skattelovgivningen-der-reguleres-efter-personskattelovens-20-2026-2027"
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
      "v": 65200,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/ligningsloven"
    },
    "enligPct": {
      "v": 11.5,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/ligningsloven"
    },
    "enligMaks": {
      "v": 52000,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/ligningsloven"
    },
    "jobPct": {
      "v": 4.5,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/ligningsloven"
    },
    "jobGraense": {
      "v": 242100,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/ligningsloven"
    },
    "jobMaks": {
      "v": 3200,
      "src": "https://svmn.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/ligningsloven"
    }
  },
  "kommuner": {
    "src": "https://svmn.dk/tal-og-metode/satser/oversigt-over-kommuneskatter",
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
        0.8
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
        25.9,
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
        25.5,
        0.96
      ],
      "Furesø": [
        24.88,
        0.7
      ],
      "Gentofte": [
        24.04,
        0.4
      ],
      "Gladsaxe": [
        23.5,
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
        0.74
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
        26.3,
        1.19
      ],
      "Holbæk": [
        25.3,
        0.96
      ],
      "Holstebro": [
        26.0,
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
        24.4,
        0.64
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
        24.6,
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
        0.62
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
        26.05,
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
        25.6,
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
        0.56
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
        25.7,
        0.93
      ],
      "Vordingborg": [
        26.3,
        1.02
      ],
      "Ærø": [
        26.1,
        1.2
      ]
    }
  }
};
})(typeof window !== "undefined" ? window : globalThis);
