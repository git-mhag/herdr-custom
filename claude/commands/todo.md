---
description: Load this Herdr space's todo list (e.g. /todo work out all todos)
argument-hint: [what to do with them]
allowed-tools: Bash(todo:*)
---
These are the open todos from the Herdr todo panel for the space this terminal belongs to:

!`todo`

Request: $ARGUMENTS

If the request above is empty, show the list and ask what to do with it. Otherwise do what it says with these todos, one at a time; say which todo you are on. The list is read-only from here: tell me which ones are finished so I can tick them off in the panel.
