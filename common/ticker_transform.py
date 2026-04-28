import json

ticker_dict = {}

with open("ticker.txt", "r") as f:
    for line in f.readlines():
        split_line = line.split('\t')
        ticker_dict[split_line[0].strip()] = split_line[1].strip()

with open("ticker.json", "w") as f:
    json.dump(ticker_dict, f)
