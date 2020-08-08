import User from '../models/user'

import { createJWT, hashPassword, comparePassword } from '../middleware/auth'
import UserCourse from '../models/user_course';
import Course from '../models/Course';


const UserResolver = {

    User: {
        courses: async ({_id}) => {
            const course = await UserCourse.find({user: _id}).populate('course')
            if (course!= null){
                return course.map(course => {
                    return course.course
                })
            }
            return[]
        }
    },

    Query: {
        user: async (root, args, context) => {
            if (!context.user) return null;
            return await User.findById(args.id)
        },
        users: async (root, args, context) => {
            if (!context.user) return null;
            return await User.find({})
        }
    },
    Mutation: {
        login: async (_, {input}, context) => {
            const {email, password} = input
            const user = await User.findOne({email: email})
            if (comparePassword(password, user.hash)){
                return {
                    authToken: {
                        accessToken: createJWT(user._id),
                        expiredAt: new Date(new Date().setDate(new Date().getDate() + 1)),
                    },
                    user: {
                        id: user._id,
                        ...user
                    }
                }
            }
            return
        },
        createUser: async (_, {input}, context) => {
            const { firstname, lastname, email, password } = input
            const user = new User({
                email,
                firstname,
                lastname,
                hash: await hashPassword(password),
            })
            const {id} = await user.save()
            return {
                authToken: {
                    accessToken: createJWT(id),
                    expiredAt: new Date(new Date().setDate(new Date().getDate() + 1)),
                },
                user: {
                    id: id,
                    firstname,
                    lastname,
                    email,
                }
            }
        },
        updateUser: async (_, args, context) => {
            const { firstname, lastname, email, password } = args.input
            await User.findByIdAndUpdate(args.id,{
                firstname,
                lastname,
                email
            }, function(err, result){
                if(err){
                    console.log(err)
                }
            })
            return {
                id: args.id,
                firstname,
                lastname,
                email,
            }
        }
    }
}

export { UserResolver }