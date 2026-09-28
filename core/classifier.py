import string
from math import log
import json

def tokenize(words):
    tokenized = []
    for word in words.split():
        stripped = word.translate(str.maketrans("", "", string.punctuation)).lower()
        if stripped != "":
            tokenized.append(stripped)
    return tokenized

def train(examples):
    letters_per_type = {}
    word_counts = {}
    words_per_type = {}
    vocab = set()
    for text,letter_type in examples:
        if letter_type not in letters_per_type:
            letters_per_type[letter_type] = 1
        else:
            letters_per_type[letter_type] += 1
        for word in tokenize(text):
            if letter_type not in word_counts:
                word_counts[letter_type] = {}
            if word not in word_counts[letter_type]:
                word_counts[letter_type][word] = 1
            else:
                word_counts[letter_type][word] += 1
            
            if letter_type not in words_per_type:
                words_per_type[letter_type] = 1
            else:
                words_per_type[letter_type] += 1
            
            vocab.add(word)
    return{"letters_per_type": letters_per_type, "word_counts" : word_counts, "words_per_type": words_per_type, "vocab": vocab}

def predict(model, text):
    words = tokenize(text)
    letters_per_type = model["letters_per_type"]
    word_counts = model["word_counts"]
    words_per_type = model["words_per_type"]
    total_letters = sum(letters_per_type.values())
    vocab_size = len(model["vocab"])
    scores = {}
    for letter_type in letters_per_type:
        prior = letters_per_type[letter_type] / total_letters
        score = log(prior)
        for word in words:
            count = word_counts[letter_type].get(word, 0)
            prob = (count + 1) / (words_per_type[letter_type] + vocab_size)
            score += log(prob)
        scores[letter_type] = score
    return max(scores, key=scores.get)

def save(model, path):
    data = dict(model)
    data["vocab"] = list(data["vocab"])
    with open(path, "w") as file:
        json.dump(data, file)
    
    
def load(path):
    with open(path) as file:
        model = json.load(file)
    model["vocab"] = set(model["vocab"])
    return model
    