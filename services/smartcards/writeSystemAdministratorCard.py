
import json
import hashlib
import sys
from smartcards.core import CardInterface

# wait for the reader to wake up and notice the card
import time
time.sleep(2)

short_value = json.dumps({
    't': 'system_administrator',
    'p': '000000',
})

print(CardInterface.card)
CardInterface.override_protection()
CardInterface.write(short_value.encode('utf-8'))

print("done")
