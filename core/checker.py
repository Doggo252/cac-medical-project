from datetime import datetime
def normalize_date(text):    
    FORMATS = ["%Y-%m-%d", "%m/%d/%Y", "%B %d, %Y", "%m-%d-%Y", "%B %dst, %Y", "%B %dnd, %Y", "%B %drd, %Y", "%B %dth, %Y"]
    for f in FORMATS:
        try:
            return datetime.strptime(text.strip(), f).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

def normalize_phone(text):
    return "".join(c for c in text if c.isdigit())
    
def normalize_text(text):
    return " ".join(text.split()).lower()

def normalize(field, value):
    if field.endswith("_date"):
        return normalize_date(value)
    elif field.endswith("_phone"):
        return normalize_phone(value)
    else:
        return normalize_text(value)

def check(form, facts):
    mismatches = []
    for field, fact in facts.items():
        if fact is None:
            continue
        written = form.get(field)
        if written is None or written.strip() == "":
            mismatches.append({"field": field, "form": written, "fact": fact})
            continue
        a = normalize(field,written)
        b = normalize(field, fact)
        if (a is None and b is None) or a != b:
            mismatches.append({"field": field, "form": written, "fact": fact})
    return mismatches
                