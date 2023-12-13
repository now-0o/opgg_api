const express = require('express');
const router = express.Router();
const { User, Rank, Tier } = require('../models');
const sequelize = require('../config/database');
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const HttpException = require('../HttpException');

router.post('/sign-up', asyncHandler(async (req, res) => {
    const {email, password, rankId, tierId} = req.body;

    if(!email||!password){
        throw new HttpException(400,"이메일과 비밀번호는 필수값입니다.");
    }

    if(!rankId){
        throw new HttpException(400,"권한 id는 필수값입니다.");
    }

    if(!tierId){
        throw new HttpException(400,"티어 id는 필수값입니다.");
    }

    const emailRegex = /^[a-zA-Z0-9]+@[a-z]+\.[a-z]+$/;
    if(!emailRegex.test(email)){
        throw new HttpException(400,"잘못된 이메일 형식입니다.");
    }
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\-]{8,15}$/;
    if(!passwordRegex.test(password)){
        throw new HttpException(400,"잘못된 비밀번호 형식입니다.");
    }

    const result = await sequelize.transaction(async () => {
        const foundRank = await Rank.findByPk(rankId);

        if(!foundRank){
            throw new HttpException(400, '존재하지 않는 권한의 ID입니다.');
        }

        const foundTier = await Tier.findByPk(tierId);

        if(!foundTier){
            throw new HttpException(400, '존재하지 않는 티어의 ID입니다.');
        }

        const foundEmail = await User.findOne({
            attributes : ['email'],
            where : {
                email
            }
        });

        if(foundEmail){
            throw new HttpException(400, '중복된 이메일입니다.');
        }

        const savedUser = await User.create({
            email,
            password,
            rankId,
            tierId
        });

        return savedUser;
    });

    res.status(201).json(result);
}));

router.post('/sign-in', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if(!email){
        throw new HttpException(400, "이메일의 값은 빈 값일 수 없습니다.");
    }
    if(!password){
        throw new HttpException(400, "비밀번호의 값은 빈 값일 수 없습니다.");
    }

    const foundUser = await User.findOne({
        attributes : ["id", "email", "password"],
        where : {
            email
        }
    })

    if(!foundUser||foundUser.password !== password){
        throw new HttpException(401, "존재하지 않는 계정이거나 잘못된 비밀번호입니다.");
    }

    const accessToken = jwt.sign({ id : foundUser.id }, process.env.JWT_SECRET, { expiresIn : "1d"});

    res.status(200).send({accessToken});
}));

module.exports = router;