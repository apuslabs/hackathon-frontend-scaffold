local ApusAI = require('@apus/ai')
-- 1. Handler to listen for prompts
Handlers.add(
  "SendRequest",
  Handlers.utils.hasMatchingTag("Action", "SendRequest"),
  function(msg)
    local prompt = msg["X-Prompt"] or ""
    local options = msg["X-Options"] or ""
    -- 2. Call the APUS AI service with a callback
    print(options)
    local taskRef = ApusAI.infer(prompt, options, function(err, res)
        if err then
            print("Error: " .. err.message)
            return
        end
        print("Attestation: " .. res.attestation)
        print("Reference: " .. res.reference)
        print("Session ID for follow-up: " .. res.session)
        print("Translation received: " .. res.data)
    end)
    print(taskRef)
    msg.reply({
        TaskRef = taskRef,
        Data = "request accepted, taskRef: " .. taskRef
    })
  end
)

-- 4. Handler to let the frontend retrieve the result
Handlers.add(
  "GetResult",
  Handlers.utils.hasMatchingTag("Action", "GetResult"),
  function(msg)
    local taskRef = msg["Taskref"]
    print(taskRef)
    -- Reply with the stored result or a "pending" message
    msg.reply({
      Data = ApusAI_Tasks[taskRef] or "Result is pending..."
    })
  end
)