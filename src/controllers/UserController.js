import User from '../models/user.js';
import bcrypt from 'bcrypt';

async function Login(req, res) {
    const { identifier, password } = req.body; // 'identifier' can be email or username

    try {
        // Find user by email or username
        const user = await User.findOne({
            $or: [{ email: identifier }, { userName: identifier }]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare password with hashed password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Return success response with user data (excluding password)
        res.status(200).json({
            message: 'Login successful',
            user: {
                userId: user.userId,
                userName: user.userName,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function Register(req, res) {
    try {
        const { userId, userName, password, name, email } = req.body;

        // Hash password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            userId,
            userName,
            password: hashedPassword,
            name,
            email
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: { userId, userName, name, email } });
    } catch (error) {
        res.status(500).json({ message: 'Registration error', error: error.message });
    }
}

async function getRanking(req, res) {
  try {
    const ranking = await User.aggregate([
      {
        $lookup: {
          from: "roadmaps",
          let: { userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
            {
              $addFields: {
                isCompleted: {
                  $eq: [
                    {
                      $size: {
                        $filter: {
                          input: "$nodes",
                          as: "node",
                          cond: { $ne: ["$$node.data.status", "2"] }
                        }
                      }
                    },
                    0
                  ]
                }
              }
            },
            { $match: { isCompleted: true } }, // Chỉ lấy lộ trình hoàn thành
            {
              $project: {
                score: {
                  $add: [
                    {
                      $switch: {
                        branches: [
                          { case: { $eq: ["$level", "0"] }, then: 1 },
                          { case: { $eq: ["$level", "1"] }, then: 2 },
                          { case: { $eq: ["$level", "2"] }, then: 3 }
                        ],
                        default: 0
                      }
                    },
                    {
                      $switch: {
                        branches: [
                          { case: { $eq: ["$duration", "0"] }, then: 0.25 },
                          { case: { $eq: ["$duration", "1"] }, then: 0.5 },
                          { case: { $eq: ["$duration", "2"] }, then: 0.75 }
                        ],
                        default: 0
                      }
                    }
                  ]
                }
              }
            }
          ],
          as: "completedRoadmaps"
        }
      },
      {
        $addFields: {
          totalScore: { $sum: "$completedRoadmaps.score" }
        }
      },
      {
        $addFields: {
          rankLevel: {
            $switch: {
              branches: [
                { case: { $gte: ["$totalScore", 80] }, then: "Advanced" },
                { case: { $gte: ["$totalScore", 40] }, then: "Intermediate" },
                { case: { $gte: ["$totalScore", 15] }, then: "Fresh" }
              ],
              default: "Beginner"
            }
          }
        }
      },
      {
        $project: {
          userId: 1,
          name: 1,
          totalScore: 1,
          rankLevel: 1
        }
      },
      { $sort: { totalScore: -1 } }
    ]);

    const rankedList = ranking.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      name: user.name,
      memberRank: user.rankLevel,
      totalScore: user.totalScore
    }));

    res.json({ success: true, ranking: rankedList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to get ranking" });
  }
}

export default {
  Login,
  Register,
  getRanking
};