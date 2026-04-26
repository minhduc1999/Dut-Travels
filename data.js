const WALRUS = "https://aggregator.walrus-mainnet.walrus.space/v1/blobs/";

function blobUrl(id) {
  return `${WALRUS}/${id}`;
}

const cities = [
  {
    name: "Da Nang",
    lat: 16.0544,
    lng: 108.2022,
    places: [
      { lat: 15.995,  lng: 107.988,  metaBlobId: "JfjGdGC79R3DvHeZkNEIwKQxfq3rJdqNSCi_5kNy2BY" },
      { lat: 16.0993, lng: 108.255,  metaBlobId: "2ZYHOqsaXT1neLfBR8kLVwzjxlOLCaq5xfi0FY2Z_lM" },
      { lat: 16.0612, lng: 108.2276, metaBlobId: "r0l-Wkp0EQkHwrn9uVVwrMxuVXFRGwduRf-_F5chusc" },
    ]
  },
  {
    name: "Hoi An",
    lat: 15.8687,
    lng: 108.3263,
    places: [
      { lat: 15.8792, lng: 108.3268, metaBlobId: "NWxq8k7bwI1uLrWJjA8PqJd-9tciJ5TAg--uPhyon5Y" },
    ]
  },
  {
    name: "Kon Tum",
    lat: 14.3538,
    lng: 108.0178,
    places: [
      { lat: 14.688, lng: 108.2701, metaBlobId: "WV7MlxQowntnQdzaVqBL1OdHX439BE3QsLuX9jER7dI" },
    ]
  },
  {
    name: "Hue",
    lat: 16.4637,
    lng: 107.5909,
    places: [
      { lat: 16.4696, lng: 107.5772, metaBlobId: "dSONrOIg432UxyUPbELrYpTi7aNGkpWzP2SLFBrmNCM" },
    ]
  },
  {
    name: "Quy Nhon",
    lat: 13.7765,
    lng: 109.2237,
    places: [
      { lat: 13.7765, lng: 109.2237, metaBlobId: "GRHQM3w7T7oJDyHKZRUjBI1N38XEGQyuDVlhHJOzzso" },
    ]
  },
  {
    name: "Quang Binh",
    lat: 17.2239,
    lng: 106.7604,
    places: [
      { lat: 17.2239, lng: 106.7604, metaBlobId: "-vYTyX7XcgMVgdGeKma8yOgoJ6ZmVar28StAao4-EKI" },
    ]
  },
  {
    name: "Ho Chi Minh City",
    lat: 10.8231,
    lng: 106.6297,
    places: [
      { lat: 10.8231, lng: 106.6297, metaBlobId: "pPQmX-rIc4a6lqNib5SXFa1qy6x3xH_6A0L2xspBs7A" },
    ]
  },
  {
    name: "Thailand",
    lat: 13.7563,
    lng: 100.5018,
    places: [
      { lat: 13.7563, lng: 100.5018, metaBlobId: "ZygzPTatnbOCte3vfwsUOlcJ3xKsE-TNOin1wHhc6R8" },
    ]
  },
  {
    name: "China",
    lat: 30.3798,
    lng: 120.9143,
    places: [
      { lat: 30.3798, lng: 120.9143, metaBlobId: "qQU95VPnb_nuC8ma2YiYj1yPGOj3vx4Tk6IwoHp0kZc" },
    ]
  },
  {
    name: "Hanoi",
    lat: 21.0285,
    lng: 105.8542,
    places: [
      { lat: 21.0285, lng: 105.8542, metaBlobId: "WB9PTCi1Ccv2pYZok6HYCPhKZE6dzOBhf8k1M97S8GY" },
    ]
  },
];
