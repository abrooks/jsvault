#!/usr/bin/python
import os
import sys
import re

print "Content-type: text/plain\n\n"
sys.stderr = sys.stdout
dbname = os.environ['PATH_INFO']
if re.match("/\w+-\w+\.txt$", dbname):
  db = open("db" + dbname, "w")
  db.write(sys.stdin.read())
  db.close()
  print "OK"
else:
  print "Invalid database name"
sys.stdout.flush()
