﻿namespace Netocracy.Console.Business
{
    public struct SortedPeer
    {
        public SortedPeer(int targetId, float trust)
        {
            TargetId = targetId;
            Trust = trust;
        }

        public int TargetId { get; set; }
        public float Trust { get; set; }
    }
}