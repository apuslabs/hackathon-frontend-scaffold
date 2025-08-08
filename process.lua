-- Backend AO Process Logic (Core Flow from section 2.5)
-- 'ApusAI = require("apus-ai")'

CurrentReference = CurrentReference or 0 -- Initialize or use existing reference counter
Results = Results or {} -- Your process's state where results are stored

-- Handler to listen for prompts from your frontend
Handlers.add(
    "SendInfer",
    Handlers.utils.hasMatchingTag("Action", "Infer"),
    function(msg)
        CurrentReference = msg["X-Reference"]
        ao.send({
            Target = "9I9F1IHS94oUABzKclMW8f2oj7_6_X9zGA_fnMZ_AzY",
            Action = "Infer",
            ["X-Prompt"] = msg.Data, 
            ["X-Reference"] = msg["X-Reference"] or msg.Reference
        })
    end
)

Handlers.add(
    "AcceptResponse",
    Handlers.utils.hasMatchingTag("Action", "Infer-Response"),
    function(msg)
        -- print("Received AI response for message ")
        print("AI response accepted for message " .. msg["X-Reference"])
        Results[msg["X-Reference"]] = msg.Data
        Send({ device = 'patch@1.0', cache = { results = Results } })
    end
)
