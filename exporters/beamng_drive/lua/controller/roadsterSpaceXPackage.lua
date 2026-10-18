-- BeamNG Lua Controller for 10-Nozzle CGT Array and Underbody Suction
local M = {}

local floorPanNodes = {"f1ll", "f1rr", "f4ll", "f4rr"}
local suctionActive = true
local cgtActive = false

local function updateGFX(dt)
    -- 1. Apply Ground Effect Surface-Normal Suction Attraction
    if suctionActive then
        local suctionForcePerNode = 46100.0 / #floorPanNodes
        for _, nodeName in ipairs(floorPanNodes) do
            local nodeId = v.data.nodes[nodeName]
            if nodeId then
                -- Apply force down relative to car chassis
                obj:applyForceVector(nodeId, vec3(0, 0, -suctionForcePerNode))
            end
        end
    end

    -- 2. Cold-Gas Thrusters
    if electrics.values.cgt_boost == 1 then
        for i = 1, 4 do
            local nodeId = v.data.nodes["cgt_r" .. i]
            if nodeId then
                obj:applyForceVector(nodeId, vec3(0, 20500.0, 0))
            end
        end
    end
end

M.updateGFX = updateGFX
return M
