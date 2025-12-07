# Two Sum

## Problem Statement
[Paste the problem statement here]

## Link
[View Problem](https://leetcode.com/problems/two-sum/)

## Difficulty
Easy / Medium / Hard

## Approach
[Describe your approach/algorithm]

## Solution

### Language: [Python/Java/C++/etc.]

```[C++]
[class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int> mp;
        vector<int> ans;
        for(int i = 0;i<nums.size();i++){
            if(mp.find(target-nums[i])!=mp.end()){
                ans.push_back(mp[target-nums[i]]);
                ans.push_back(i);
            }
            mp[nums[i]] = i;

        }
        return ans;
    }
};]
```

## Time Complexity
O([complexity])

## Space Complexity
O([complexity])

## Key Points
- [Important point 1]
- [Important point 2]
- [Important point 3]

## Edge Cases Considered
- [Edge case 1]
- [Edge case 2]

## Alternative Approaches
[If you have multiple solutions, describe them here]

## Notes
[Any additional notes, learnings, or observations]

