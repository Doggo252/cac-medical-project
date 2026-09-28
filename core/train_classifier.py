import csv, random
from classifier import train, predict, save

data = []

with open("data/synthetic/texts.csv") as file:
    for row in csv.DictReader(file):
        data.append((row["text"], row["letter_type"]))
        
random.seed(1)
random.shuffle(data)

cut = int(len(data) * 0.8)
train_rows = data[:cut]
test_rows = data[cut:]

model = train(train_rows)

correct = 0
for (text, letter_type) in test_rows:
    if predict(model, text) == letter_type:
        correct += 1

accuracy = f"{(correct/len(test_rows))*100}%"
print(f"The number of correct answers is {correct} and the percentage of correct answers is {accuracy}")

save(model, "app/public/model.json")